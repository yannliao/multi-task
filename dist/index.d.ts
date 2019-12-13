import Pool from './pool';
import { TaskType } from './interfaces';
import { TaskWraper, TaskWraperAsync } from './wraper';
declare function init(): Pool;
declare function run(task: {
    type: string;
    data: any;
}): Promise<unknown>;
declare function terminate(): Promise<void>;
declare function register(tasktype: TaskType): Promise<void>;
export { TaskType };
export { init, run, terminate, register };
export { TaskWraper, TaskWraperAsync };
