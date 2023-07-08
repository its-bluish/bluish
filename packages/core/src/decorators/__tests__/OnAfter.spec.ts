import { Context } from '../../models/Context.js'
import { Runner } from '../../models/Runner.js'
import { AfterRunEvent } from '../../models/events/AfterRunEvent.js'
import { getSourceMetadata } from '../../tools/getSourceMetadata.js'
import { OnAfter } from '../OnAfter.js'

describe('OnAfter', () => {
  it('adds on after middleware to source metadata', () => {
    const fn = jest.fn()

    @OnAfter(fn)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([
      expect.objectContaining({ onAfter: fn }),
    ])
  })

  it('adds on after middleware to source trigger metadata', () => {
    const fn = jest.fn()

    class Test {
      @OnAfter(fn)
      public method(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('method').middlewares,
    ).toEqual([expect.objectContaining({ onAfter: fn })])
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

  it('run after middleware in source metadata', async () => {
    const fn = jest.fn()

    @OnAfter(fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toHaveBeenCalledWith(expect.any(AfterRunEvent))
  })

  it('run after middleware in source trigger metadata', async () => {
    const fn = jest.fn()

    class Test {
      @OnAfter(fn)
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toHaveBeenCalledWith(expect.any(AfterRunEvent))
  })

  it('never run after middleware on source metadata if you have an error', async () => {
    const fn = jest.fn()

    @OnAfter(fn)
    class Test {
      public method(): void {
        throw new Error()
      }
    }

    await expect(
      async () => await new TestRunner(Test, 'method').toHandle()(),
    ).rejects.toThrowError()

    expect(fn).not.toHaveBeenCalledWith(expect.any(AfterRunEvent))
  })

  it('never run after middleware in source metadata if context instance is different from constructor', async () => {
    const fn = jest.fn()

    class AnotherContext extends Context {}

    @OnAfter(AnotherContext, fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).not.toHaveBeenCalledWith(expect.any(AfterRunEvent))
  })
})
