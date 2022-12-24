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

  it('create SignalR negotiate trigger', async () => {
    const onSignalRInfo = jest.fn()
    @App({
      signalR: 'testing',
    })
    class AppTest {
      public onSignalRInfo = onSignalRInfo
    }

    const context: Record<string, unknown> = {}

    await expect(
      run(
        // @ts-expect-error: The __bluishSignalRNegotiate__ property is not visible in the typescript's typing
        new Runner(AppTest, '__bluishSignalRNegotiate__'),
        context,
        {
          method: 'POST',
          headers: {},
        },
        {
          itsMe: true,
        },
      ),
    ).resolves.toBeUndefined()

    expect(context.res).toEqual(
      expect.objectContaining({
        body: {
          itsMe: true,
        },
      }),
    )

    expect(onSignalRInfo).toHaveBeenCalled()
  })
})
