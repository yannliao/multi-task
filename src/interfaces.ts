import { Worker } from 'worker_threads'

export interface Task {
    data: any
    resolve: Function
    reject: Function
    type: string
}

export type State = 'ready' | 'spawning' | 'running' | 'dead'

export interface TaskType {
    type: string
    module: string
}

export interface Executor extends TaskType {
    status: State
    worker: Worker
}
export interface WorkerResponse<T = {}> {
    error: {
        message: string,
        stack: string
    }
    data: T
}


export type Name = string; 