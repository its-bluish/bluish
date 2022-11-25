import { Runner } from '../../models/Runner'
import { Trigger } from '../triggers/Trigger'
import { run } from '../../test-utils/run'
import { OnDestroy } from '../OnDestroy'
import { Context } from '../../models/contexts/Context'
import { MockContext } from '../../test-utils/MockContext'

describe('OnDestroy', () => {
  it('called as trigger decorator', async () => {
    const onDestroy = jest.fn()
    class OnDestroyTest {
      @Trigger({ Context: MockContext })
      @OnDestroy(onDestroy)
      public run = () => ({})
    }

    await run(new Runner(OnDestroyTest, 'run'))

    expect(onDestroy).toHaveBeenCalledWith(expect.any(MockContext))
  })

  it('called as class decorator', async () => {
    const onDestroy = jest.fn()

    @OnDestroy(onDestroy)
    class OnDestroyTest {
      @Trigger({ Context: MockContext })
      public run = () => ({})
    }

    await run(new Runner(OnDestroyTest, 'run'))

    expect(onDestroy).toHaveBeenCalledWith(expect.any(MockContext))
  })

  it('called as a decorator of a property other than the trigger', async () => {
    const onDestroy = jest.fn()

    class OnDestroyTest {
      @Trigger({ Context: MockContext })
      public run = () => ({})

      @OnDestroy()
      public init(context: Context) {
        onDestroy(context)
      }
    }

    await run(new Runner(OnDestroyTest, 'run'))

    expect(onDestroy).toHaveBeenCalledWith(expect.any(MockContext))
  })
})
