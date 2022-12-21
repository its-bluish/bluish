import { Runner } from '../../models/Runner'
import { run } from '../../test-utils/run'
import { TestingContext } from '../../test-utils/TestingContext'
import { Log } from '../Log'
import { Trigger } from '../triggers/Trigger'

describe('Log', () => {
  it('.Initialize', async () => {
    const logInitialize = jest.fn()
    class LogInitializeTest {
      @Trigger({ Context: TestingContext })
      @Log.Initialize(logInitialize)
      public run = () => ({})
    }

    await run(new Runner(LogInitializeTest, 'run'))

    expect(logInitialize).toHaveBeenCalledWith(expect.any(TestingContext))
  })

  it('.Success', async () => {
    const logSuccess = jest.fn()
    class LogSuccessTest {
      @Trigger({ Context: TestingContext })
      @Log.Success(logSuccess)
      public run = () => ({})
    }

    await run(new Runner(LogSuccessTest, 'run'))

    expect(logSuccess).toHaveBeenCalledWith({}, expect.any(TestingContext))
  })

  it('.Error', async () => {
    const logError = jest.fn()
    class LogErrorTest {
      @Trigger({ Context: TestingContext })
      @Log.Error(logError)
      public testing = () => {
        throw new Error('Testing')
      }
    }

    await expect(run.testing(LogErrorTest)).rejects.toThrowError('Testing')

    expect(logError).toHaveBeenCalledWith(expect.any(Error), expect.any(TestingContext))
  })

  it('.Destroy', async () => {
    const logDestroy = jest.fn()
    class LogDestroyTest {
      @Trigger({ Context: TestingContext })
      @Log.Destroy(logDestroy)
      public run = () => ({})
    }

    await run(new Runner(LogDestroyTest, 'run'))

    expect(logDestroy).toHaveBeenCalledWith(expect.any(TestingContext))
  })
})
