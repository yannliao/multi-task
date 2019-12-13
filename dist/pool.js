"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const os_1 = require("os");
const fs_1 = __importDefault(require("fs"));
const READY = 'ready';
const SPAWNING = 'spawning';
const RUNNING = 'running';
const DEAD = 'dead';
const CPUS = os_1.cpus().length;
class Pool {
    constructor() {
        this.workers = [];
        this.taskMap = new Map();
    }
    // private taskTypeMap: Map<string, TaskType> = new Map<string, TaskType>()
    free(worker) {
        for (let i = 0; i < this.workers.length; i++) {
            if (worker.threadId === this.workers[i].worker.threadId) {
                this.workers[i].status = READY;
                this.workers[i].worker.removeAllListeners();
                this.tick();
                break;
            }
        }
    }
    tick() {
        // check for dead threads and heal them
        this.workers
            .filter(({ status }) => status === DEAD)
            .forEach((deadWorker) => this.heal(deadWorker));
        if (this.taskMap.size === 0) {
            return;
        }
        for (let [type, queue] of this.taskMap) {
            if (queue.length == 0) {
                continue;
            }
            else {
                let usable;
                for (let i = 0; i < this.workers.length; i++) {
                    let worker = this.workers[i];
                    if (worker.status === READY && type == worker.type) {
                        usable = this.workers[i];
                        break;
                    }
                }
                if (typeof usable === 'undefined')
                    return;
                let task = queue.shift();
                const { worker } = usable;
                usable.status = RUNNING;
                const { data, resolve, reject } = task;
                try {
                    worker.once('message', (message) => {
                        this.free(worker);
                        if (typeof message.error === 'undefined' || message.error === null) {
                            return resolve(message.data);
                        }
                        const error = new Error(message.error.message);
                        error.stack = message.error.stack;
                        reject(error);
                    });
                    worker.once('error', (error) => {
                        usable.status = DEAD;
                        reject(error);
                        this.tick();
                    });
                    worker.postMessage({ type, data });
                }
                catch (err) {
                    this.free(worker);
                    reject(err);
                }
            }
        }
    }
    heal(deadWorker) {
        // self healing procedure
        // const worker = new Worker(type.module, { eval: true })
        const worker = new worker_threads_1.Worker(deadWorker.module);
        deadWorker.status = SPAWNING;
        deadWorker.worker = worker;
        worker.once('online', () => process.nextTick(() => {
            deadWorker.status = READY;
            worker.removeAllListeners();
            this.tick();
        }));
        worker.once('error', (error) => {
            console.error(error);
            deadWorker.status = DEAD;
            worker.removeAllListeners();
            this.tick();
        });
    }
    push({ type, data, resolve, reject }) {
        const found = this.workers.find(worker => worker.type === type);
        if (found) {
            if (!this.taskMap.has(type)) {
                this.taskMap.set(type, []);
            }
            this.taskMap.get(type).push({ type, data, resolve, reject });
            this.tick();
            return true;
        }
        return false;
    }
    register(tasktype) {
        if (this.workers.length >= CPUS) {
            console.warn(`Workers more than cpu core\n`);
        }
        if (this.workers.length >= 10) {
            console.warn(`More than 10 workers.  https://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n\n`);
        }
        if (!tasktype.type || !tasktype.module) {
            throw new Error('param error');
        }
        fs_1.default.accessSync(tasktype.module, fs_1.default.constants.R_OK | fs_1.default.constants.W_OK);
        for (let i = 0; i < this.workers.length; i++) {
            if (tasktype.type === this.workers[i].type) {
                if (tasktype.module !== this.workers[i].module) {
                    throw new Error('Can not register same type task with different module path');
                }
            }
        }
        return new Promise((resolve, reject) => {
            // const worker = new Worker(type.module, { eval: true })
            const worker = new worker_threads_1.Worker(tasktype.module);
            this.workers.push({
                status: SPAWNING,
                worker,
                type: tasktype.type,
                module: tasktype.module
            });
            let index = this.workers.length - 1;
            worker.once('online', (index => () => {
                // next tick
                process.nextTick(() => {
                    this.workers[index].status = READY;
                    // remove listeners
                    this.workers[index].worker.removeAllListeners();
                    resolve();
                });
            })(index));
            //error handler
            worker.once('error', (index => (error) => {
                this.workers[index].status = DEAD;
                this.workers[index].worker.removeAllListeners();
                reject(error);
            })(index));
        });
    }
    async terminate() {
        try {
            const pArray = [];
            for (let workerObj of this.workers) {
                let { worker } = workerObj;
                pArray.push(worker.terminate());
            }
            await Promise.all(pArray);
            this.workers = [];
            this.taskMap.clear();
        }
        catch (err) {
            console.log(err);
            throw new Error('clean worker poll fail');
        }
    }
}
exports.default = Pool;
