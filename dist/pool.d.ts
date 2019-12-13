/// <reference types="node" />
import { Worker } from 'worker_threads';
import { Task, Executor, TaskType } from './interfaces';
export default class Pool {
    private workers;
    private taskMap;
    free(worker: Worker): void;
    tick(): void;
    heal(deadWorker: Executor): void;
    push({ type, data, resolve, reject }: Task): Boolean;
    register(tasktype: TaskType): Promise<void>;
    terminate(): Promise<void>;
}
