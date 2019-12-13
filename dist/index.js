"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("./pool"));
const wraper_1 = require("./wraper");
exports.TaskWraper = wraper_1.TaskWraper;
exports.TaskWraperAsync = wraper_1.TaskWraperAsync;
const worker_threads_1 = require("worker_threads");
let pollInstance;
function init() {
    if (worker_threads_1.isMainThread) {
        if (!pollInstance) {
            pollInstance = new pool_1.default();
        }
        return pollInstance;
    }
    else {
        throw new Error('Please do not call this function in worker thread!');
    }
}
exports.init = init;
function run(task) {
    if (worker_threads_1.isMainThread) {
        return new Promise((resolve, reject) => {
            if (typeof task.type !== 'string') {
                return reject(new Error('type must be string'));
            }
            if (!pollInstance) {
                return reject(new Error('Please initiate TaskRunner using Function init'));
            }
            let status = pollInstance.push({ type: task.type, data: task.data, resolve, reject });
            if (!status) {
                throw new Error('Task not founded in worker pool');
            }
        });
    }
    else {
        throw new Error('Please do not call this function in worker thread!');
    }
}
exports.run = run;
async function terminate() {
    if (worker_threads_1.isMainThread) {
        if (!pollInstance) {
            throw (new Error('Please init TaskRunner using init'));
        }
        return await pollInstance.terminate();
    }
    else {
        throw new Error('Please do not call this function in worker thread!');
    }
}
exports.terminate = terminate;
async function register(tasktype) {
    if (worker_threads_1.isMainThread) {
        if (!pollInstance) {
            init();
        }
        return await pollInstance.register(tasktype);
    }
    else {
        throw new Error('Please do not call this function in worker thread!');
    }
}
exports.register = register;
