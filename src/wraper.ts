import { isMainThread, parentPort } from 'worker_threads'
/**
 * 同步任务处理模块生成函数，将同步任务处理函数用worker_threads的通信接口包裹
 * @param fun 任务处理函数，需要return 相关内容
 */
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
/**
 * 异步任务处理模块生成函数，将异步任务处理函数用worker_threads的通信接口包裹
 * @param fun 任务处理函数，需要return 相关内容
 */
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