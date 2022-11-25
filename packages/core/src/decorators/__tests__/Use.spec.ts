import { Runner } from '../../models/Runner'
import { Trigger } from '../triggers/Trigger'
import { run } from '../../test-utils/run'
import { Use } from '../Use'
import { Plugin } from '../../models/Plugin'
import { MockContext } from '../../test-utils/MockContext'

describe('Use', () => {
  describe('called as trigger decorator', () => {
    it.each([
      [
        class PluginOnInitialize extends Plugin {
          public onInitialize = jest.fn()
        },
        (plugin: Plugin): Plugin['onInitialize'] => plugin.onInitialize,
        [expect.any(MockContext)],
      ],
      [
        class PluginOnDestroy extends Plugin {
          public onDestroy = jest.fn()
        },
        (plugin: Plugin): Plugin['onDestroy'] => plugin.onDestroy,
        [expect.any(MockContext)],
      ],
      [
        class PluginOnError extends Plugin {
          public onError = jest.fn()

          public onInitialize() {
            throw new Error('testing')
          }
        },
        (plugin: Plugin): Plugin['onError'] => plugin.onError,
        [expect.any(Error), expect.any(MockContext)],
      ],
    ])('%p', async (TestingPlugin, getFn, args) => {
      const plugin = new TestingPlugin()

      class UseTest {
        @Trigger({ Context: MockContext })
        @Use(plugin)
        public run = () => ({})
      }

      await run(new Runner(UseTest, 'run')).catch(() => void 0)

      expect(getFn(plugin)).toHaveBeenCalledWith(...args)
    })
  })

  describe('called as class decorator', () => {
    it.each([
      [
        class PluginOnInitialize extends Plugin {
          public onInitialize = jest.fn()
        },
        (plugin: Plugin): Plugin['onInitialize'] => plugin.onInitialize,
        [expect.any(MockContext)],
      ],
      [
        class PluginOnDestroy extends Plugin {
          public onDestroy = jest.fn()
        },
        (plugin: Plugin): Plugin['onDestroy'] => plugin.onDestroy,
        [expect.any(MockContext)],
      ],
      [
        class PluginOnError extends Plugin {
          public onError = jest.fn()

          public onInitialize() {
            throw new Error('testing')
          }
        },
        (plugin: Plugin): Plugin['onError'] => plugin.onError,
        [expect.any(Error), expect.any(MockContext)],
      ],
    ])('%p', async (TestingPlugin, getFn, args) => {
      const plugin = new TestingPlugin()

      @Use(plugin)
      class UseTest {
        @Trigger({ Context: MockContext })
        public run = () => ({})
      }

      await run(new Runner(UseTest, 'run')).catch(() => void 0)

      expect(getFn(plugin)).toHaveBeenCalledWith(...args)
    })
  })
})
