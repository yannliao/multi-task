"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
function TaskWraper(fun) {
    if (worker_threads_1.isMainThread) {
        throw new Error('Please do not call this function in main thread!');
    }
    else {
        worker_threads_1.parentPort.on('message', ({ type, data }) => {
            const response = {
                error: null,
                data: null
            };
            response.data = fun(type, data);
            worker_threads_1.parentPort.postMessage(response);
        });
    }
}
exports.TaskWraper = TaskWraper;
async function TaskWraperAsync(fun) {
    if (worker_threads_1.isMainThread) {
        throw new Error('Please do not call this function in main thread!');
    }
    else {
        worker_threads_1.parentPort.on('message', async ({ type, data }) => {
            const response = {
                error: null,
                data: null
            };
            try {
                response.data = await fun(type, data);
            }
            catch (error) {
                response.error = error;
            }
            worker_threads_1.parentPort.postMessage(response);
        });
    }
}
exports.TaskWraperAsync = TaskWraperAsync;
