import { Context } from '../../models/Context.js'
import { Runner } from '../../models/Runner.js'
import { RunErrorEvent } from '../../models/events/RunErrorEvent.js'
import { getSourceMetadata } from '../../tools/getSourceMetadata.js'
import { OnError } from '../OnError.js'

describe('OnError', () => {
  it('adds on after middleware to source metadata', () => {
    const fn = jest.fn()

    @OnError(fn)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([
      expect.objectContaining({ onError: fn }),
    ])
  })

  it('adds on after middleware to source trigger metadata', () => {
    const fn = jest.fn()

    class Test {
      @OnError(fn)
      public method(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('method').middlewares,
    ).toEqual([expect.objectContaining({ onError: fn })])
  })

  class TestContext extends Context {}

  class TestRunner<
    TPropertyKey extends string,
    TTarget extends { [K in TPropertyKey]: (...args: any[]) => unknown },
  > extends Runner<TPropertyKey, TTarget, TestContext> {
    public toReturn(payload: unknown, context: TestContext): void {}
    public toContext(...args: any[]): TestContext {
      return new TestContext(this, ...args)
    }
  }

  it('run error middleware on source metadata if error', async () => {
    const fn = jest.fn()

    @OnError(fn)
    class Test {
      public method(): void {
        throw new Error()
      }
    }

    await new TestRunner(Test, 'method')
      .toHandle()()
      .catch(() => {})

    expect(fn).toHaveBeenCalledWith(expect.any(RunErrorEvent))
  })

  it('run error middleware on source trigger metadata if error', async () => {
    const fn = jest.fn()

    class Test {
      @OnError(fn)
      public method(): void {
        throw new Error()
      }
    }

    await new TestRunner(Test, 'method')
      .toHandle()()
      .catch(() => {})

    expect(fn).toHaveBeenCalledWith(expect.any(RunErrorEvent))
  })

  it('never run error middleware on source metadata if there is no error', async () => {
    const fn = jest.fn()

    @OnError(fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).not.toHaveBeenCalled()
  })

  it('never run error middleware on source trigger metadata if there is no error', async () => {
    const fn = jest.fn()

    class Test {
      @OnError(fn)
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).not.toHaveBeenCalled()
  })

  it('never run before middleware in source metadata if context instance is different from constructor', async () => {
    const fn = jest.fn()

    class AnotherContext extends Context {}

    @OnError(AnotherContext, fn)
    class Test {
      public method(): void {
        throw new Error()
      }
    }

    await expect(
      async () => await new TestRunner(Test, 'method').toHandle()(),
    ).rejects.toThrowError()

    expect(fn).not.toHaveBeenCalledWith(expect.any(RunErrorEvent))
  })
})
