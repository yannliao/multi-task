
// const { parentPort } = require('worker_threads')
// parentPort.on('message', ({type, data}) => {
//     const response = {
//         error: null,
//         data: null
//     }
//     if (!Number.isInteger(data)) {
//         throw new Error('param error')
//     }


//     response.data = fibonacci(data)

//     parentPort.postMessage(response)
// })
const { TaskWraper } = require('../dist/index.js')

function fibonacci(n) {
    if (n == 0) return 0
    else if (n == 1) return 1
    else return fibonacci(n - 1) + fibonacci(n - 2)
}

TaskWraper((type, data) => {
    return fibonacci(data)
})
