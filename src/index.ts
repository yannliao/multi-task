import Pool from './pool'
import { TaskType } from './interfaces'
import { TaskWraper, TaskWraperAsync } from './wraper'
import { isMainThread } from 'worker_threads'

let pollInstance: Pool

function init(): Pool {
    if (isMainThread) {
        if (!pollInstance) {
            pollInstance = new Pool()
        }
        return pollInstance
    } else {
        throw new Error('Please do not call this function in worker thread!')
    }
}
function run(task: { type: string, data: any }) {
    if (isMainThread) {
        return new Promise((resolve, reject) => {
            if (typeof task.type !== 'string') {
                return reject(new Error('type must be string'))
            }
            if (!pollInstance) {
                return reject(new Error('Please initiate TaskRunner using Function init'))
            }

            let status = pollInstance.push({ type: task.type, data: task.data, resolve, reject })
            if (!status) {
                throw new Error('Task not founded in worker pool')
            }
        })
    } else {
        throw new Error('Please do not call this function in worker thread!')
    }

}
async function terminate() {
    if (isMainThread) {
        if (!pollInstance) {
            throw (new Error('Please init TaskRunner using init'))
        }
        return await pollInstance.terminate()
    } else {
        throw new Error('Please do not call this function in worker thread!')
    }
}

async function register(tasktype: TaskType) {
    if (isMainThread) {
        if (!pollInstance) {
            init()
        }
        return await pollInstance.register(tasktype)
    } else {
        throw new Error('Please do not call this function in worker thread!')
    }
}


export { TaskType }
export { init, run, terminate, register }
export { TaskWraper, TaskWraperAsync }