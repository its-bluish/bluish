import { TestHttpRunner } from '../../../testing/index.js'
import { Params } from '../Params.js'
import { GET } from '../methods.js'

describe('Params', () => {
  it('set parameters value to request params', async () => {
    const fn = jest.fn()

    class Test {
      @GET('/:user')
      public method(@Params params: unknown): void {
        fn(params)
      }
    }

    await new TestHttpRunner(Test, 'method').handle('/123')

    expect(fn).toHaveBeenCalledWith({ user: '123' })
  })

  it('set parameters value to request params with selector', async () => {
    const fn = jest.fn()

    class Test {
      @GET('/:user')
      public method(@Params(params => params.user) params: unknown): void {
        fn(params)
      }
    }

    await new TestHttpRunner(Test, 'method').handle('/123')

    expect(fn).toHaveBeenCalledWith('123')
  })
})
