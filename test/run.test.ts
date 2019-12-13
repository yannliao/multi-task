import path from 'path'

import {
    describe,
    it,
    before,
    after,
} from 'mocha'
import { expect } from 'chai'

import { init, run, terminate, register } from '../src/index'
describe('task test', function () {
    describe('# init test', function () {

        after(async () => {
            await terminate()
        })

        it('shoud throw an unregister error', async () => {
            let err
            try {
                await run({ type: 'calculate', data: 10000 })
            } catch (error) {
                err = error
            }
            expect(err).to.be.an('error')
            expect(err.name).to.equal('Error')
            expect(err.message).to.equal('Please initiate TaskRunner using Function init')
            expect(err.stack).to.be.a('string')
        })

        it('shoud init without any error', async () => {
            let instance
            try {
                instance = await init()
            } catch (error) {
                console.log(error)
            }
            expect(instance).to.be.an('object')
        })

        it('shoud throw an register error', async () => {
            let err
            try {
                await register({
                    type: 'calculate',
                    module: path.resolve(__dirname, './task.js')
                })
            } catch (error) {
                err = error
            }
            expect(err).to.be.an('error')
        })
        it('shoud register without any error', async () => {
            let err
            try {
                await register({
                    type: 'calculate',
                    module: path.resolve(__dirname, './calculate.js')
                })

                await register({
                    type: 'fibonacci',
                    module: path.resolve(__dirname, './fibonacci.js')
                })

                await register({
                    type: 'fibonacci',
                    module: path.resolve(__dirname, './fibonacci.js')
                })
            } catch (error) {
                err = error
            }
            expect(err).to.be.an('undefined')
        })

        it('shoud throw an register error', async () => {
            let err
            try {
                await register({
                    type: 'fibonacci',
                    module: path.resolve(__dirname, './calculate.js')
                })

                await register({
                    type: 'calculate',
                    module: path.resolve(__dirname, './fibonacci.js')
                })
            } catch (error) {
                err = error
            }
            expect(err).to.be.an('Error')
            expect(err.message).to.equal('Can not register same type task with different module path')
            expect(err.stack).to.be.a('string')
        })

    })

    describe('# task runing test', function () {
        before(async function () {
            await register({
                type: 'calculate',
                module: path.resolve(__dirname, './calculate.js')
            })
            await register({
                type: 'fibonacci',
                module: path.resolve(__dirname, './fibonacci.js')
            })

            await register({
                type: 'fibonacci',
                module: path.resolve(__dirname, './fibonacci.js')
            })

            await register({
                type: 'fibonacci',
                module: path.resolve(__dirname, './fibonacci.js')
            })
        })
        after(async () => {
            await terminate()
        })
        it('shoud run one task without error', async () => {
            let result
            try {
                result = await run({ type: 'calculate', data: 10000 })
            } catch (error) {
                console.log(error)
            }
            expect(result).to.equal(10000)

        })

        it('shoud run multi task in parallel without error', async () => {
            let results
            try {
                let fArray = [run({ type: 'fibonacci', data: 40 }), run({ type: 'fibonacci', data: 40 }), run({ type: 'fibonacci', data: 40 })]
                results = await Promise.all(fArray)
            } catch (error) {
                console.log(error)
            }
            expect(results).to.be.an('array')
        })

        it('shoud run multi type task without error', async () => {
            let results
            let fibonacciResult
            let err
            try {
                let pArray = [run({ type: 'calculate', data: 20000 }), run({ type: 'calculate', data: 5000 }), run({ type: 'calculate', data: 100000 })]
                let fArray = [run({ type: 'fibonacci', data: 40 }), run({ type: 'fibonacci', data: 40 })]

                results = await Promise.all(pArray)
                expect(results).to.eql([20000, 5000, 100000]).but.not.equal([20000, 5000, 100000])
                expect(results).to.be.an('array').ordered.members([20000, 5000, 100000])

                fibonacciResult = await Promise.all(fArray)
                expect(fibonacciResult).to.be.an('array')
            } catch (error) {
                err = error
                console.log(error)
            }

            expect(err).to.be.an('undefined')
        })

        it('shoud throw param error', async () => {
            let err
            try {
                await run({ type: 'calculate', data: 'error string' })
            } catch (error) {
                err = error
            }
            expect(err).to.be.a('object')
            expect(err.name).to.equal('Error')
            expect(err.message).to.equal('param error')
            expect(err.stack).to.be.a('string')
        })
    })
    describe('# terminate test', function () {
        before(async function () {
            await register({
                type: 'calculate',
                module: path.resolve(__dirname, './calculate.js')
            })
            await register({
                type: 'fibonacci',
                module: path.resolve(__dirname, './fibonacci.js')
            })
        })
        it('shoud terminate with no error', async () => {
            let err
            try {
                await terminate()
            } catch (error) {
                err = error
            }
            expect(err).to.be.a('undefined')
        })
    })
})