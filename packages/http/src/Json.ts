import { ReadableStream } from 'stream/web'

import { Middleware, type BeforeRunEvent } from '@bluish/core'
import { is } from 'type-is'

import { HttpContext } from './models/HttpContext.js'

export class Json extends Middleware<HttpContext> {
  public readonly for = [HttpContext]

  public async onBefore(event: BeforeRunEvent<HttpContext>): Promise<void> {
    const contentType = event.context.request.headers.get('Content-Type')

    if (!contentType) return

    if (!is(contentType, '*/json')) return

    if (typeof event.context.request.body === 'string') {
      event.context.request.body = await JSON.parse(event.context.request.body)

      return
    }

    if (typeof event.context.request.body !== 'object') return

    if (!(event.context.request.body instanceof ReadableStream)) return

    const buffers: Buffer[] = []

    for await (const chunk of event.context.request.body.values({
      preventCancel: true,
    }))
      buffers.push(chunk)

    event.context.request.body = await JSON.parse(
      Buffer.concat(buffers).toString('utf-8'),
    )
  }
}
