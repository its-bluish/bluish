import { TestHttpRunner } from '../../../testing/index.js'
import { Param } from '../Param.js'
import { GET } from '../methods.js'

describe('Param', () => {
  it('set parameters value to request params match', async () => {
    const fn = jest.fn()

    class Test {
      @GET('/:user')
      public method(@Param('user') userId: unknown): void {
        fn(userId)
      }
    }

    await new TestHttpRunner(Test, 'method').handle('/123')

    expect(fn).toHaveBeenCalledWith('123')
  })

  it('set parameters value to request params match with selector', async () => {
    const fn = jest.fn()

    class User {
      public id!: string
    }

    class Test {
      @GET('/:user')
      @Param('user', id => Object.assign(new User(), { id }))
      public method(@Param('user') user: User): void {
        fn(user)
      }
    }

    await new TestHttpRunner(Test, 'method').handle('/123')

    expect(fn).toHaveBeenCalledWith(expect.any(User))
    expect(fn).toHaveBeenCalledWith({ id: '123' })
  })

  it('never execute selector when parameter is undefined', async () => {
    const fn = jest.fn()

    class User {
      public id!: string
    }

    class Test {
      @GET('(/:user)')
      @Param('user', id => Object.assign(new User(), { id }))
      public method(@Param('user') user: User): void {
        fn(user)
      }
    }

    await new TestHttpRunner(Test, 'method').handle('/')

    expect(fn).toHaveBeenCalledWith(undefined)
  })
})
