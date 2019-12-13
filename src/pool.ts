
import { Worker } from 'worker_threads'
import { cpus } from 'os'
import fs from 'fs'

import { Task, Executor, TaskType } from './interfaces'


const READY = 'ready'
const SPAWNING = 'spawning'
const RUNNING = 'running'
const DEAD = 'dead'


const CPUS = cpus().length

export default class Pool {
    private workers: Array<Executor> = []
    private taskMap: Map<string, Array<Task>> = new Map<string, Array<Task>>()
    // private taskTypeMap: Map<string, TaskType> = new Map<string, TaskType>()

    free(worker: Worker): void {
        for (let i = 0; i < this.workers.length; i++) {
            if (worker.threadId === this.workers[i].worker.threadId) {
                this.workers[i].status = READY
                this.workers[i].worker.removeAllListeners()
                this.tick()
                break;
            }
        }
    }

    tick() {
        // check for dead threads and heal them
        this.workers
            .filter(({ status }) => status === DEAD)
            .forEach((deadWorker: Executor) => this.heal(deadWorker))

        if (this.taskMap.size === 0) {
            return
        }
        for (let [type, queue] of this.taskMap) {
            if (queue.length == 0) {
                continue
            } else {
                let usable: Executor
                for (let i = 0; i < this.workers.length; i++) {
                    let worker = this.workers[i];
                    if (worker.status === READY && type == worker.type) {
                        usable = this.workers[i]
                        break
                    }
                }

                if (typeof usable === 'undefined') return

                let task = queue.shift()
                const { worker } = usable
                usable.status = RUNNING

                const { data, resolve, reject } = task

                try {
                    worker.once('message', (message: any) => {
                        this.free(worker)

                        if (typeof message.error === 'undefined' || message.error === null) {
                            return resolve(message.data)
                        }

                        const error = new Error(message.error.message)
                        error.stack = message.error.stack
                        reject(error)
                    })

                    worker.once('error', (error: Error) => {
                        usable.status = DEAD
                        reject(error)
                        this.tick()
                    })

                    worker.postMessage({ type, data })
                } catch (err) {
                    this.free(worker)
                    reject(err)
                }
            }
        }

    }

    heal(deadWorker: Executor): void {
        // self healing procedure
        // const worker = new Worker(type.module, { eval: true })
        const worker = new Worker(deadWorker.module)

        deadWorker.status = SPAWNING
        deadWorker.worker = worker

        worker.once('online', () =>
            process.nextTick(() => {
                deadWorker.status = READY
                worker.removeAllListeners()
                this.tick()
            })
        )
        worker.once('error', (error: Error) => {
            console.error(error)
            deadWorker.status = DEAD
            worker.removeAllListeners()
            this.tick()
        })
    }

    push({ type, data, resolve, reject }: Task): Boolean {
        const found = this.workers.find(worker => worker.type === type);
        if (found) {
            if (!this.taskMap.has(type)) {
                this.taskMap.set(type, [])
            }
            this.taskMap.get(type).push({ type, data, resolve, reject })
            this.tick()
            return true
        }
        return false
    }

    register(tasktype: TaskType): Promise<void> {
        if (this.workers.length >= CPUS) {
            console.warn(`Workers more than cpu core\n`)
        }
        if (this.workers.length >= 10) {
            console.warn(`More than 10 workers.  https://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n\n`)
        }

        if (!tasktype.type || !tasktype.module) {
            throw new Error('param error')
        }
        
        fs.accessSync(tasktype.module, fs.constants.R_OK | fs.constants.W_OK);
        for (let i = 0; i < this.workers.length; i++) {
            if (tasktype.type === this.workers[i].type) {
                if(tasktype.module !== this.workers[i].module) {
                    throw new Error('Can not register same type task with different module path')
                }
            }
        }

        return new Promise((resolve, reject) => {
            // const worker = new Worker(type.module, { eval: true })
            const worker = new Worker(tasktype.module)
            this.workers.push({
                status: SPAWNING,
                worker,
                type: tasktype.type,
                module: tasktype.module
            })
            let index = this.workers.length - 1
            worker.once('online',
                (index => () => {
                    // next tick
                    process.nextTick(() => {
                        this.workers[index].status = READY

                        // remove listeners
                        this.workers[index].worker.removeAllListeners()
                        resolve()
                    })
                })(index)
            )

            //error handler
            worker.once('error',
                (index => (error: Error) => {
                    this.workers[index].status = DEAD
                    this.workers[index].worker.removeAllListeners()
                    reject(error)
                })(index)
            )
        })

    }
    async terminate() {
        try {
            const pArray = []

            for (let workerObj of this.workers) {
                let { worker } = workerObj
                pArray.push(worker.terminate())
            }

            await Promise.all(pArray)
            this.workers = []
            this.taskMap.clear()
        } catch (err) {
            console.log(err)
            throw new Error('clean worker poll fail')
        }
    }
}