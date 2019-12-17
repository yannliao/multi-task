# Multi task
利用Node.js 的 [worker_threads](https://nodejs.org/docs/latest-v12.x/api/worker_threads.html) 实现的并发任务处理库。Node.js v12+ 可以直接运行，Node.js v10+ 可以通过添加`--experimental-worker`标识来运行。

## 使用

首先任务处理模块需要使用`TaskWraper` 或者 `TaskWraperAsync`包裹。然后用`register`将任务注册(生成一个worker线程),`run`函数可以将任务插入任务队列，进行处理。如果`register`注册多个相同类型的任务,则会有多个线程并性处理。

主进程代码
```
    const { init, run, terminate, register } = require('multi-task')

    await register({
        type: 'fibonacci',
        module: path.resolve(__dirname, './fibonacci.js')
    })

    let result = await run({ type: 'calculate', data: 10000 })
```
子线程任务处理代码
```
    const { TaskWraper } = require('../dist/index.js')

    function fibonacci(n) {
        if (n == 0) return 0
        else if (n == 1) return 1
        else return fibonacci(n - 1) + fibonacci(n - 2)
    }

    TaskWraper((type, data) => {
        return fibonacci(data)
    })
```

# 文档
文档生成：
```
    npm run doc
```

[生成的详细文档在docs文件夹](docs/index.html)