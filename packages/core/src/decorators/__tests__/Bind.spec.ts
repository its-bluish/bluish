import { Runner } from '../../models/Runner'
import { run } from '../../test-utils/run'
import { TestingContext } from '../../test-utils/TestingContext'
import { TestingTrigger } from '../../test-utils/TestingTrigger'
import { Bind } from '../Bind'

describe('Bind', () => {
  it('appends to the first and only argument', async () => {
    const testing = jest.fn()
    class Testing {
      @TestingTrigger()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public testing(@Bind() context: TestingContext) {
        // eslint-disable-next-line prefer-rest-params
        testing(...arguments)
      }
    }

    await expect(run(new Runner(Testing, 'testing'))).resolves.toBeUndefined()

    expect(testing).toHaveBeenCalledWith(expect.any(TestingContext))
  })

  it('appends to the first and second argument', async () => {
    const testing = jest.fn()
    class Testing {
      @TestingTrigger()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public testing(@Bind() arg0: TestingContext, @Bind() arg1: TestingContext) {
        // eslint-disable-next-line prefer-rest-params
        testing(...arguments)
      }
    }

    await expect(run(new Runner(Testing, 'testing'))).resolves.toBeUndefined()

    expect(testing).toHaveBeenCalledWith(expect.any(TestingContext), expect.any(TestingContext))
  })

  it('appends and uses a picker for the first and only argument', async () => {
    const testing = jest.fn()
    class Testing {
      @TestingTrigger()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public testing(@Bind(() => 'testing') arg0: TestingContext) {
        // eslint-disable-next-line prefer-rest-params
        testing(...arguments)
      }
    }

    await expect(run.testing(Testing)).resolves.toBeUndefined()
    expect(testing).toHaveBeenCalledWith('testing')
  })
})
