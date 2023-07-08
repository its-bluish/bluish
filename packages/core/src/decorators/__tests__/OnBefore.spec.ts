import { Context } from '../../models/Context.js'
import { Runner } from '../../models/Runner.js'
import { BeforeRunEvent } from '../../models/events/BeforeRunEvent.js'
import { getSourceMetadata } from '../../tools/getSourceMetadata.js'
import { OnBefore } from '../OnBefore.js'

describe('OnBefore', () => {
  it('adds on after middleware to source metadata', () => {
    const fn = jest.fn()

    @OnBefore(fn)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([
      expect.objectContaining({ onBefore: fn }),
    ])
  })

  it('adds on after middleware to source trigger metadata', () => {
    const fn = jest.fn()

    class Test {
      @OnBefore(fn)
      public method(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('method').middlewares,
    ).toEqual([expect.objectContaining({ onBefore: fn })])
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

  it('run before middleware in source metadata', async () => {
    const fn = jest.fn()

    @OnBefore(fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toBeCalledWith(expect.any(BeforeRunEvent))
  })

  it('run before middleware in source trigger metadata', async () => {
    const fn = jest.fn()

    class Test {
      @OnBefore(fn)
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toBeCalledWith(expect.any(BeforeRunEvent))
  })

  it('never run before middleware in source metadata if context instance is different from constructor', async () => {
    const fn = jest.fn()

    class AnotherContext extends Context {}

    @OnBefore(AnotherContext, fn)
    class Test {
      public method(): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).not.toHaveBeenCalledWith(expect.any(BeforeRunEvent))
  })
})
