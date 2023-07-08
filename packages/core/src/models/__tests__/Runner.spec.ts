import { OnAfter } from '../../decorators/OnAfter.js'
import { OnBefore } from '../../decorators/OnBefore.js'
import { OnError } from '../../decorators/OnError.js'
import { OnFinish } from '../../decorators/OnFinish.js'
import { OnInitialize } from '../../decorators/OnInitialize.js'
import { Selector } from '../../decorators/Selector.js'
import { Application } from '../Application.js'
import { Context } from '../Context.js'
import { Runner } from '../Runner.js'

const sleep = async <T = void>(ms: number, value?: T) =>
  await new Promise<T>(resolve => setTimeout(resolve, ms, value as T))

class Click<T = void> implements PromiseLike<T> {
  private _resolve!: Function
  private _reject!: Function
  private readonly _promise: Promise<T>

  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  public async resolve(value: T): Promise<void> {
    this._resolve(value)

    return await sleep(0)
  }

  public async reject(reason: unknown): Promise<void> {
    this._reject(reason)

    return await sleep(0)
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected)
  }
}

describe('Runner', () => {
  class TestContext extends Context {}

  class TestRunner<
    TPropertyKey extends string,
    TTarget extends { [K in TPropertyKey]: (...args: any[]) => unknown },
  > extends Runner<TPropertyKey, TTarget, TestContext> {
    public toReturn = jest.fn((payload: unknown, context: TestContext) => {})
    public toContext(...args: any[]): TestContext {
      return new TestContext(this as any, ...args)
    }
  }

  it('preserves the order of events called without error', async () => {
    const clicks = {
      initialize: new Click(),
      before: new Click(),
      execute: new Click(),
      error: new Click(),
      after: new Click(),
      finish: new Click(),
    }
    const onInitialize = jest.fn(() => clicks.initialize)
    const onBefore = jest.fn(() => clicks.before)
    const onExecute = jest.fn(() => clicks.execute)
    const onAfter = jest.fn(() => clicks.after)
    const onFinish = jest.fn(() => clicks.finish)
    const onError = jest.fn(() => clicks.error)

    @OnInitialize(onInitialize)
    @OnBefore(onBefore)
    @OnAfter(onAfter)
    @OnFinish(onFinish)
    @OnError(onError)
    class Test {
      public method() {
        return onExecute()
      }
    }

    void new TestRunner(Test, 'method').toHandle()()

    await sleep(0)

    expect(onInitialize).toHaveBeenCalled()
    expect(onBefore).not.toHaveBeenCalled()
    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.initialize.resolve()

    expect(onBefore).toHaveBeenCalled()
    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.before.resolve()

    expect(onExecute).toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.execute.resolve()

    expect(onAfter).toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.after.resolve()

    expect(onFinish).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.finish.resolve()

    expect(onError).not.toHaveBeenCalled()
  })

  it('preserves the order of events called with error in before event', async () => {
    const clicks = {
      initialize: new Click(),
      before: new Click(),
      execute: new Click(),
      error: new Click(),
      after: new Click(),
      finish: new Click(),
    }
    const onInitialize = jest.fn(() => clicks.initialize)
    const onBefore = jest.fn(() => clicks.before)
    const onExecute = jest.fn(() => clicks.execute)
    const onAfter = jest.fn(() => clicks.after)
    const onFinish = jest.fn(() => clicks.finish)
    const onError = jest.fn(() => clicks.error)

    @OnInitialize(onInitialize)
    @OnBefore(onBefore)
    @OnAfter(onAfter)
    @OnFinish(onFinish)
    @OnError(onError)
    class Test {
      public method() {
        return onExecute()
      }
    }

    void expect(
      new TestRunner(Test, 'method').toHandle()(),
    ).rejects.toThrowError()

    await sleep(0)

    expect(onInitialize).toHaveBeenCalled()
    expect(onBefore).not.toHaveBeenCalled()
    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.initialize.resolve()

    expect(onBefore).toHaveBeenCalled()
    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.before.reject(new Error())

    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()

    await clicks.error.resolve()

    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).toHaveBeenCalled()

    await clicks.finish.resolve()

    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
  })

  it('preserves the order of events called with error in execution call', async () => {
    const clicks = {
      initialize: new Click(),
      before: new Click(),
      execute: new Click(),
      error: new Click(),
      after: new Click(),
      finish: new Click(),
    }
    const onInitialize = jest.fn(() => clicks.initialize)
    const onBefore = jest.fn(() => clicks.before)
    const onExecute = jest.fn(() => clicks.execute)
    const onAfter = jest.fn(() => clicks.after)
    const onFinish = jest.fn(() => clicks.finish)
    const onError = jest.fn(() => clicks.error)

    @OnInitialize(onInitialize)
    @OnBefore(onBefore)
    @OnAfter(onAfter)
    @OnFinish(onFinish)
    @OnError(onError)
    class Test {
      public method() {
        return onExecute()
      }
    }

    void expect(
      async () => await new TestRunner(Test, 'method').toHandle()(),
    ).rejects.toThrowError()

    await sleep(0)

    expect(onInitialize).toHaveBeenCalled()
    expect(onBefore).not.toHaveBeenCalled()
    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.initialize.resolve()

    expect(onBefore).toHaveBeenCalled()
    expect(onExecute).not.toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.before.resolve()

    expect(onExecute).toHaveBeenCalled()
    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()

    await clicks.execute.reject(new Error())

    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()

    await clicks.error.resolve()

    expect(onAfter).not.toHaveBeenCalled()
    expect(onFinish).toHaveBeenCalled()

    await clicks.finish.resolve()

    expect(onAfter).not.toHaveBeenCalled()
  })

  it('receive execute payload in Runner.prototype.toReturn', async () => {
    class Test {
      public method() {
        return 'Hello World'
      }
    }

    const runner = new TestRunner(Test, 'method')

    await runner.toHandle()()

    expect(runner.toReturn).toHaveBeenCalledWith(
      'Hello World',
      expect.any(TestContext),
    )
  })

  it('receive error treat payload in Runner.prototype.toReturn', async () => {
    class Test {
      @OnError(event => {
        event.treat('Bye World')
      })
      public method() {
        throw new Error()
      }
    }

    const runner = new TestRunner(Test, 'method')

    await runner.toHandle()()

    expect(runner.toReturn).toHaveBeenCalledWith(
      'Bye World',
      expect.any(TestContext),
    )
  })

  it('map parameters using selector', async () => {
    const fn = jest.fn()
    class Test {
      public method(@Selector() context: TestContext) {
        fn(context)
      }
    }

    const runner = new TestRunner(Test, 'method')

    await runner.toHandle()()

    expect(fn).toHaveBeenCalledWith(expect.any(TestContext))
  })

  it('run with application instance', async () => {
    class App extends Application {
      public onInitialize = jest.fn()
      public onBefore = jest.fn()
      public onAfter = jest.fn()
      public onFinish = jest.fn()
    }

    class Test {
      public method() {}
    }

    const runner = new TestRunner(Test, 'method', App)

    await runner.toHandle()()

    expect(runner.application?.onInitialize).toHaveBeenCalled()
    expect(runner.application?.onBefore).toHaveBeenCalled()
    expect(runner.application?.onAfter).toHaveBeenCalled()
    expect(runner.application?.onFinish).toHaveBeenCalled()
  })

  it('break run in before event default prevent', async () => {
    class Test {
      @OnBefore(event => {
        event.break('Break in before event')
      })
      public method() {
        return 'Never'
      }
    }

    const runner = new TestRunner(Test, 'method')

    await runner.toHandle()()

    expect(runner.toReturn).toHaveBeenCalledWith(
      'Break in before event',
      expect.any(TestContext),
    )
  })
})
