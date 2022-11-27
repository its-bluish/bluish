import { Runner } from '../../models/Runner'
import { Trigger } from '../triggers/Trigger'
import { run } from '../../test-utils/run'
import { OnError } from '../OnError'
import { Context } from '../../models/contexts/Context'
import { TestingContext } from '../../test-utils/TestingContext'

describe('OnError', () => {
  it('called as trigger decorator', async () => {
    const onError = jest.fn()
    class OnErrorTest {
      @Trigger({ Context: TestingContext })
      @OnError(onError)
      public run() {
        throw new Error('testing')
      }
    }

    await expect(run(new Runner(OnErrorTest, 'run'))).rejects.toThrowError()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(TestingContext))
  })

  it('called as class decorator', async () => {
    const onError = jest.fn()

    @OnError(onError)
    class OnErrorTest {
      @Trigger({ Context: TestingContext })
      public run() {
        throw new Error('testing')
      }
    }

    await expect(run(new Runner(OnErrorTest, 'run'))).rejects.toThrowError()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(TestingContext))
  })

  it('called as a decorator of a property other than the trigger', async () => {
    const onError = jest.fn()

    class OnErrorTest {
      @Trigger({ Context: TestingContext })
      public run() {
        throw new Error('testing')
      }

      @OnError()
      public onError(error: unknown, context: Context) {
        onError(error, context)
      }
    }

    await expect(run(new Runner(OnErrorTest, 'run'))).rejects.toThrowError()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(TestingContext))
  })
})
