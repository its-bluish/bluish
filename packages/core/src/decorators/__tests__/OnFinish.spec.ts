import { Context } from '../../models/Context.js'
import { Runner } from '../../models/Runner.js'
import { RunFinishEvent } from '../../models/events/RunFinishEvent.js'
import { getSourceMetadata } from '../../tools/getSourceMetadata.js'
import { OnFinish } from '../OnFinish.js'

describe('OnFinish', () => {
  it('adds on after middleware to source metadata', () => {
    const fn = jest.fn()

    @OnFinish(fn)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([
      expect.objectContaining({ onFinish: fn }),
    ])
  })

  it('adds on after middleware to source trigger metadata', () => {
    const fn = jest.fn()

    class Test {
      @OnFinish(fn)
      public method(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('method').middlewares,
    ).toEqual([expect.objectContaining({ onFinish: fn })])
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

  it('run finish middleware in source metadata', async () => {
    const fn = jest.fn()

    @OnFinish(fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toHaveBeenCalledWith(expect.any(RunFinishEvent))
  })

  it('run finish middleware in source trigger metadata', async () => {
    const fn = jest.fn()

    class Test {
      @OnFinish(fn)
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toHaveBeenCalledWith(expect.any(RunFinishEvent))
  })

  it('never run finish middleware in source metadata if context instance is different from constructor', async () => {
    const fn = jest.fn()

    class AnotherContext extends Context {}

    @OnFinish(AnotherContext, fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).not.toHaveBeenCalledWith(expect.any(RunFinishEvent))
  })

  it('run final middleware on source metadata even with an error throw', async () => {
    const fn = jest.fn()

    @OnFinish(fn)
    class Test {
      public method(): void {
        throw new Error()
      }
    }

    await expect(
      async () => await new TestRunner(Test, 'method').toHandle()(),
    ).rejects.toThrowError()

    expect(fn).toHaveBeenCalledWith(expect.any(RunFinishEvent))
  })
})
