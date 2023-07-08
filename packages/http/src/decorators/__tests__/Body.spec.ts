import { Body } from '../Body.js'
import { TestHttpRunner } from '../../../testing/index.js'

import '../../models/HttpSourceBinder.js'
import '../../models/HttpSourceTriggerBinder.js'

describe('Body', () => {
  it('set parameter value to request body', async () => {
    const fn = jest.fn()

    class Test {
      public method(@Body body: unknown): void {
        fn(body)
      }
    }

    await new TestHttpRunner(Test, 'method').handle(undefined, {
      body: 'Hello World',
    })

    expect(fn).toHaveBeenCalledWith('Hello World')
  })
})
