import { Transform } from "../../decorators/Transform"
import { HttpTrigger } from "../../decorators/triggers/HttpTrigger"
import { Use } from "../../decorators/Use"
import { PromiseToo } from "../../typings/PromiseToo"
import { AzureFunctionContext, Context } from "../contexts/Context"
import { AzureHttpRequest, HttpContext } from "../contexts/HttpContext"
import { Plugin } from "../Plugin"
import { Runner } from "../Runner"

describe('Runner', () => {
  it('1', async () => {
    class Test {
      @HttpTrigger('/', 'get')
      public run(context: HttpContext) {
        return { ok: true }
      }
    }

    const runner = new Runner(Test, 'run')

    const data = await runner.toAzureFunction()({} as AzureFunctionContext, {} as AzureHttpRequest)

    expect(data).toEqual({ ok: true })
  })

  it('2', async () => {
    const [onInitialize, onDestroy] = [jest.fn(), jest.fn()]
    class TestPlugin extends Plugin {
      public onInitialize(context: Context): PromiseToo<void> {
        onInitialize()
      }

      public onDestroy(context: Context): PromiseToo<void> {
        onDestroy()
      }

      public transform(data: object, context: Context): unknown {
        return { ...data, touchPlugin: true }
      }
    }

    class Test {
      @HttpTrigger('/', 'get')
      @Use(new TestPlugin())
      public run(context: HttpContext) {
        return { ok: true }
      }
    }

    const runner = new Runner(Test, 'run')

    const data = await runner.toAzureFunction()({} as AzureFunctionContext, {} as AzureHttpRequest)

    expect(onInitialize).toHaveBeenCalled()

    expect(onDestroy).toHaveBeenCalled()

    expect(data).toEqual({ ok: true, touchPlugin: true })
  })

  it('3', async () => {
    const [onError] = [jest.fn()]
    class TestPlugin extends Plugin {
      public onError(error: unknown, context: Context): PromiseToo<void> {
        onError()
      }
    }

    class Test {
      @HttpTrigger('/', 'get')
      @Use(new TestPlugin())
      public run(context: HttpContext) {
        throw new Error('test');
        
      }
    }

    await new Runner(Test, 'run')
      .toAzureFunction()({} as AzureFunctionContext, {} as AzureHttpRequest)
      .catch(() => void 0)

    expect(onError).toHaveBeenCalled()
  })

  it('4', async () => {
    class Test {
      @Transform((data) => ({ ...data as object, touch: true }))
      @HttpTrigger('/', 'get')
      public run() {
        return { ok: true }
      }
    }

    const data = await new Runner(Test, 'run')
      .toAzureFunction()({} as AzureFunctionContext, {} as AzureHttpRequest)

    expect(data).toEqual({ ok: true, touch: true })
  })
})