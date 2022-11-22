import { Runner } from "../../models/Runner"
import { Trigger } from "../triggers/Trigger"
import { run } from '../../test-utils/run'
import { Use } from "../Use"
import { Context } from "../../models/contexts/Context"
import { Plugin } from "../../models/Plugin"
import { MockContext } from "../../test-utils/MockContext"

describe('Use', () => {
  describe('called as trigger decorator', () => {
    it.each([
      [
        class PluginOnInitialize extends Plugin { public onInitialize = jest.fn() },
        (plugin: Plugin) => plugin.onInitialize,
        [expect.any(Context)]
      ],
      [
        class PluginOnDestroy extends Plugin { public onDestroy = jest.fn() },
        (plugin: Plugin) => plugin.onDestroy,
        [expect.any(Context)]
      ],
      [
        class PluginOnError extends Plugin {
          public onError = jest.fn()
  
          public onInitialize() { throw new Error('testing'); }
        },
        (plugin: Plugin) => plugin.onError,
        [expect.any(Error), expect.any(Context)]
      ],
    ])('%p', async (Plugin, getFn, args) => {
      const plugin = new Plugin()

      class UseTest {
        @Trigger({ Context: MockContext })
        @Use(plugin)
        public run() {}
      }

      await run(new Runner(UseTest, 'run')).catch(() => void 0)

      expect(getFn(plugin)).toHaveBeenCalledWith(...args)
    })
  })

  describe('called as class decorator', () => {
    it.each([
      [
        class PluginOnInitialize extends Plugin { public onInitialize = jest.fn() },
        (plugin: Plugin) => plugin.onInitialize,
        [expect.any(Context)]
      ],
      [
        class PluginOnDestroy extends Plugin { public onDestroy = jest.fn() },
        (plugin: Plugin) => plugin.onDestroy,
        [expect.any(Context)]
      ],
      [
        class PluginOnError extends Plugin {
          public onError = jest.fn()
  
          public onInitialize() { throw new Error('testing'); }
        },
        (plugin: Plugin) => plugin.onError,
        [expect.any(Error), expect.any(Context)]
      ],
    ])('%p', async (Plugin, getFn, args) => {
      const plugin = new Plugin()

      @Use(plugin)
      class UseTest {
        @Trigger({ Context: MockContext })
        public run() {}
      }

      await run(new Runner(UseTest, 'run')).catch(() => void 0)

      expect(getFn(plugin)).toHaveBeenCalledWith(...args)
    })
  })
})

declare global {
  namespace jest {
    interface Expect {
      any<T extends Constructor | (abstract new (...args: any[]) => any)>(classType: T): T extends Func ? ReturnType<T> : InstanceType<T>;
    }
  }
}
