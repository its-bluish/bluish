import { ReadableStream } from 'stream/web'

import { Middleware, type BeforeRunEvent } from '@bluish/core'
import { is } from 'type-is'

import { HttpContext } from './models/HttpContext.js'

export interface UrlEncodedOptions {
  extended: boolean
}

export class UrlEncoded extends Middleware<HttpContext> {
  public readonly for = [HttpContext]

  protected readonly extended: boolean

  constructor({ extended = false }: UrlEncodedOptions) {
    super()
    this.extended = extended
  }

  protected async parse(search: string): Promise<Record<string, unknown>> {
    if (this.extended) {
      const qs = await import('qs')

      return qs.parse(search)
    }

    const queryString = await import('querystring')

    return queryString.parse(search)
  }

  public async onBefore(event: BeforeRunEvent<HttpContext>): Promise<void> {
    const contentType = event.context.request.headers.get('Content-Type')

    event.context.request.params = await this.parse(
      event.context.request.url.search,
    )

    if (!contentType) return

    if (!is(contentType, '*/x-www-form-urlencoded')) return

    if (typeof event.context.request.body === 'string') {
      event.context.request.body = await this.parse(event.context.request.body)

      return
    }

    if (typeof event.context.request.body !== 'object') return

    if (!(event.context.request.body instanceof ReadableStream)) return

    const buffers: Buffer[] = []

    for await (const chunk of event.context.request.body.values({
      preventCancel: true,
    }))
      buffers.push(chunk)

    event.context.request.body = await this.parse(
      Buffer.concat(buffers).toString('utf-8'),
    )
  }
}
