import { run } from '../../test-utils/run'
import { TestingTrigger } from '../../test-utils/TestingTrigger'
import { OnSuccess } from '../OnSuccess'

describe('OnSuccess', () => {
  it('adds the status 200 to the result', async () => {
    class Testing {
      @TestingTrigger()
      @OnSuccess((payload) => ({ status: 200, body: payload }))
      public testing() {
        return null
      }
    }

    await expect(run.testing(Testing)).resolves.toEqual({ status: 200, body: null })
  })
})
