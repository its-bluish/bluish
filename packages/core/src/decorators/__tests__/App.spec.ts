import { Runner } from '../../models/Runner'
import { TestingContext } from '../../test-utils/TestingContext'
import { run } from '../../test-utils/run'
import { App } from '../App'
import { OnInitialize } from '../OnInitialize'
import { Trigger } from '../triggers/Trigger'

describe('App', () => {
  describe('Hooks', () => {
    it('OnInitialize', async () => {
      const onInitialize = jest.fn()
      @App()
      class AppTest {
        @OnInitialize()
        public onInitialize = onInitialize
      }

      class TriggerTest {
        @Trigger({ Context: TestingContext })
        public run() {
          return 'Ok'
        }
      }

      await expect(run(new Runner(TriggerTest, 'run', AppTest))).resolves.toBe('Ok')
      expect(onInitialize).toHaveBeenCalled()
    })
  })
})
