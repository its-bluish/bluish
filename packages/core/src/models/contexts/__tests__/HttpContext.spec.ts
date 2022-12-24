import { AzureFunctionContext } from '../Context'
import { HttpContext, AzureHttpRequest } from '../HttpContext'

describe('HttpContext', () => {
  it('set response header to content-type application/json', () => {
    const httpContext = new HttpContext(
      {} as AzureFunctionContext,
      { headers: {} } as AzureHttpRequest,
    )

    httpContext.setHeader('Content-Type', 'application/json')

    httpContext.success({})

    expect(httpContext.azureFunctionContext.res).toEqual(
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )
  })

  it('throws the error again', () => {
    const httpContext = new HttpContext(
      {} as AzureFunctionContext,
      { headers: {} } as AzureHttpRequest,
    )

    expect(() => httpContext.unhandledError(new Error('testing'))).toThrowError('testing')
  })

  it('receives an error-handled payload', () => {
    const httpContext = new HttpContext(
      {} as AzureFunctionContext,
      { headers: {} } as AzureHttpRequest,
    )

    httpContext.handledError({
      status: 400,
      body: { message: 'Bad Request' },
    })

    expect(httpContext.azureFunctionContext.res).toEqual(
      expect.objectContaining({
        status: 400,
        body: { message: 'Bad Request' },
      }),
    )
  })

  it('preconfigure a status for the reply', () => {
    const httpContext = new HttpContext(
      {} as AzureFunctionContext,
      { headers: {} } as AzureHttpRequest,
    )

    httpContext.status(201)

    httpContext.success({})

    expect(httpContext.azureFunctionContext.res).toEqual(
      expect.objectContaining({
        status: 201,
      }),
    )
  })

  it('turns headers to be accessed in lowercase too', () => {
    const httpContext = new HttpContext(
      {} as AzureFunctionContext,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      } as unknown as AzureHttpRequest,
    )

    expect(httpContext.headers).toEqual(
      expect.objectContaining({
        'content-type': 'application/json',
      }),
    )
  })
})
