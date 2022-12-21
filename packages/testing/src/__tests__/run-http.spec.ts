/* eslint-disable no-param-reassign */
import { Http, HttpContext, OnError, OnInitialize } from '@bluish/core'
import { run } from '..'

describe('run.http', () => {
  it('returned context is an instance of HttpContext', async () => {
    class Testing {
      @Http.Get('/tests')
      public testing() {}
    }

    await expect(run.http(Testing, 'testing')).resolves.toBeInstanceOf(HttpContext)
  })

  it('throws an error when the parameter is not sent', async () => {
    class Testing {
      @Http.Get('/tests/{testId}')
      public testing() {}
    }

    await expect(run.http(Testing, 'testing')).rejects.toThrowError('TODO')
  })

  it('replace parameter in url', async () => {
    class Testing {
      @Http.Get('/tests/{testId}')
      public testing() {}
    }

    const context = await run.http(Testing, 'testing', {
      params: {
        testId: '12345',
      },
    })

    expect(context.url).toEqual('http://localhost:8080/tests/12345')
  })

  it('run the initialization hook', async () => {
    class Testing {
      @Http.Get('/tests/{testId}')
      @OnInitialize(
        (context: HttpContext) => void (context.params.testId = Number(context.params.testId)),
      )
      public testing() {}
    }

    const context = await run.http(Testing, 'testing', {
      params: {
        testId: '12345',
      },
    })

    expect(context.params.testId).toEqual(12345)
  })

  it('do the error handling', async () => {
    class Testing {
      @Http.Get('/tests')
      @OnError((error: unknown) => ({ status: 400, body: (error as Error).message }))
      public testing() {
        throw new Error('Ops...')
      }
    }

    const context = await run.http(Testing, 'testing')

    expect(context.response).toEqual({ status: 400, body: 'Ops...', headers: {} })
  })

  it.each(['post', 'delete', 'head', 'patch', 'put', 'options', 'trace', 'connect'] as const)(
    'throws an error when trying to send an unmapped method %s',
    async (method) => {
      class Testing {
        @Http.Get('/tests')
        public testing() {}
      }

      await expect(run.http[method](Testing, 'testing')).rejects.toThrowError('TODO')
    },
  )
})
