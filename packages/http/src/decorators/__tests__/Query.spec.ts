import { TestHttpRunner } from '../../../testing/index.js'
import { Query } from '../Query.js'

describe('Query', () => {
  it('set parameter value to request query', async () => {
    const fn = jest.fn()
    class Tests {
      public test(@Query query: Record<string, unknown>): void {
        fn(query)
      }
    }

    await new TestHttpRunner(Tests, 'test').handle('/?name=Testing')

    expect(fn).toBeCalledWith({ name: 'Testing' })
  })

  it('set parameter value to request query with selector string', async () => {
    const fn = jest.fn()
    class Tests {
      public test(@Query('name') name: string): void {
        fn(name)
      }
    }

    await new TestHttpRunner(Tests, 'test').handle('/?name=Testing')

    expect(fn).toBeCalledWith('Testing')
  })

  it('set parameter value to request query with selector', async () => {
    const fn = jest.fn()
    class Tests {
      public test(@Query(query => query.name) name: string): void {
        fn(name)
      }
    }

    await new TestHttpRunner(Tests, 'test').handle('/?name=Testing')

    expect(fn).toBeCalledWith('Testing')
  })
})
