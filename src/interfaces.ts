import { Worker } from 'worker_threads'
import { cpus } from 'os'
/**
 * 待处理的任务
 */
export interface Task {
    data: any
    resolve: Function
    reject: Function
    type: string
}
/**
 * worker 状态
 */
export type State = 'ready' | 'spawning' | 'running' | 'dead'

/**
 * 任务注册类型
 */
export interface TaskType {
    type: string
    module: string
}

/**
 * 任务执行器对象，包含相应的处理函数
 */
export interface Executor extends TaskType {
    status: State
    worker: Worker
}
/**
 * ready 状态，表示线程可用
 */
export const READY = 'ready'
/**
 * spawning 状态，表示线程正在初始化
 */
export const SPAWNING = 'spawning'
/**
 * running 状态，表示线程正在运行相关任务
 */
export const RUNNING = 'running'
/**
 * dead 状态，表示线程僵死
 */
export const DEAD = 'dead'

export const NODE_VERSION = process.version.replace('v', '').split('.')

export const CPUS = cpus().length
