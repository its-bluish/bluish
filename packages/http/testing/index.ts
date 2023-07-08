import UrlPattern from 'url-pattern'
import { Runner } from '@bluish/core'

import { Request } from '../src/models/Request.js'
import { Response } from '../src/models/Response.js'
import { HttpContext } from '../src/models/HttpContext.js'
import { Headers } from '../src/models/Headers.js'

export interface TestRequestInput {
  headers?: Record<string, string>
  body?: unknown
}

export class TestRequest extends Request {
  public params: Record<string, unknown>
  public query: Record<string, unknown>
  public headers: Headers
  public body: unknown
  public url: URL

  constructor(
    context: HttpContext,
    pathOrUrl: string = 'http://localhost.test',
    { body, headers = {} }: TestRequestInput = {},
  ) {
    super(context)
    const path = context.runner.metadata.useBinder('http').route

    this.url =
      typeof pathOrUrl === 'string'
        ? new URL(`http://localhost.test${pathOrUrl}`)
        : pathOrUrl
    this.headers = new Headers(headers)
    this.params = {}
    this.query = Object.fromEntries(this.url.searchParams)
    this.body = body

    if (path) {
      const pattern = new UrlPattern(`(http\\://)localhost.test${path}`)
      const match = pattern.match(this.url.toString())

      if (match) Object.assign(this.params, pattern.match(this.url.toString()))
    }
  }
}

export class TestResponse extends Response {
  public status: number = 200
  public headers: Record<string, unknown> = {}
  public body: unknown
}

export class TestHttpContext extends HttpContext {
  public request: Request
  public response: Response = new TestResponse(this)

  constructor(
    runner: Runner<any, any, any>,
    pathOrUrl?: string,
    request?: TestRequestInput,
  ) {
    super(runner)
    this.request = new TestRequest(this, pathOrUrl, request)
  }
}

export class TestHttpRunner<
  TPropertyKey extends string,
  TTarget extends { [K in TPropertyKey]: (...args: any[]) => unknown },
> extends Runner<TPropertyKey, TTarget, TestHttpContext> {
  public toReturn(payload: unknown, context: TestHttpContext): void {}
  public toContext(
    pathOrUrl?: string,
    request?: TestRequestInput,
  ): TestHttpContext {
    return new TestHttpContext(this, pathOrUrl, request)
  }
}
