// const { parentPort } = require('worker_threads')
// parentPort.on('message', ({type, data}) => {
//     const response = {
//         error: null,
//         data: null
//     }
//     if (!Number.isInteger(data)) {
//         throw new Error('param error')
//     }
//     function caculate() {
//         let i = 0, result = 0
//         for (i = 0; i < data; i++) {
//             result++
//         }

//         return result
//     }
//     response.data = caculate()

//     parentPort.postMessage(response)
// })

const { TaskWraper } = require('../dist/index.js')

function caculate(type, data) {
    if (!Number.isInteger(data)) {
        throw new Error('param error')
    }

    let i = 0, result = 0
    for (i = 0; i < data; i++) {
        result++
    }
    return result
}


TaskWraper(caculate)
