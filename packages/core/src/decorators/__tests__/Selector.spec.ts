import { Context } from '../../models/Context.js'
import { Runner } from '../../models/Runner.js'
import { type PromiseLikeToo } from '../../typings/helpers.js'
import { Selector } from '../Selector.js'

describe('Selector', () => {
  class TestContext extends Context {
    public sayHi(): string {
      return 'Hi'
    }
  }

  class TestRunner<
    TPropertyKey extends string,
    TTarget extends {
      [K in TPropertyKey]: (...args: any[]) => PromiseLikeToo<unknown>
    },
  > extends Runner<TPropertyKey, TTarget, TestContext> {
    public toReturn(payload: unknown, context: TestContext): void {}
    public toContext(...args: any[]): TestContext {
      return new TestContext(this, ...args)
    }
  }

  it('selector without argument returns the context instance itself for the parameter', async () => {
    const fn = jest.fn()

    class Test {
      public method(@Selector() context: TestContext): void {
        fn(context)
      }
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toBeCalledWith(expect.any(TestContext))
  })

  it('selector is executed with a parameter of the context instance', async () => {
    const selector = jest.fn(v => v)

    class Test {
      public method(@Selector(selector) context: TestContext): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(selector).toBeCalledWith(expect.any(TestContext))
  })

  it('when selecting something from within the context, the parameter receives the same return value', async () => {
    const fn = jest.fn()

    class Test {
      public method(
        @Selector(context => (context as TestContext).sayHi()) text: string,
      ): void {
        fn(text)
      }
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toBeCalledWith('Hi')
  })

  it('when selecting a context instance different from the constructor the parameter becomes null', async () => {
    const fn = jest.fn()

    class AnotherContext extends Context {}

    class Test {
      public method(
        @Selector(AnotherContext, context => context) context: AnotherContext,
      ): void {
        fn(context)
      }
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toBeCalledWith(null)
  })

  it('when selecting a context instance equal to the constructor, the picker is executed', async () => {
    const fn = jest.fn()

    class Test {
      public method(@Selector(TestContext, fn) context: unknown): void {}
    }

    await new TestRunner(Test, 'method').toHandle()()

    expect(fn).toBeCalledWith(expect.any(TestContext))
  })
})
