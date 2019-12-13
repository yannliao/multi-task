import { isMainThread, parentPort } from 'worker_threads'
export function TaskWraper(fun: (type: string, data: any) => any) {
    if (isMainThread) {
        throw new Error('Please do not call this function in main thread!')
    } else {
        parentPort.on('message', ({ type, data }) => {
            const response = {
                error: null,
                data: null
            }
            response.data = fun(type, data)
            parentPort.postMessage(response)
        })
    }
}

export async function TaskWraperAsync(fun: (type: string, data: any) => {}) {
    if (isMainThread) {
        throw new Error('Please do not call this function in main thread!')
    } else {
        parentPort.on('message', async ({ type, data }) => {
            const response = {
                error: null,
                data: null
            }
            try {
                response.data = await fun(type, data)
            } catch (error) {
                response.error = error
            }
            parentPort.postMessage(response)
        })
    }
}