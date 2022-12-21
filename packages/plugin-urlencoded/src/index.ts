import { HttpContext, OnInitialize } from '@bluish/core'
import { is } from 'type-is'

export interface BluishUrlencodedPluginOptions {
  extended?: boolean
}

function isContentTypeFormUrlencoded(context: HttpContext): string | false {
  return is(context.headers['content-type'], 'application/x-www-form-urlencoded')
}

async function getParser(
  extended: boolean,
): Promise<typeof import('qs') | typeof import('querystring')> {
  if (extended) return import('qs')
  return import('querystring')
}

export default function BluishUrlencoded({ extended = true }: BluishUrlencodedPluginOptions = {}) {
  return OnInitialize(async (context): Promise<void> => {
    if (!(context instanceof HttpContext)) return void 0

    const parser = await getParser(extended)

    const { search } = new URL(context.url)
    const query = parser.parse(search.replace(/^\?/, ''))

    Object.assign(context, { query })

    if (typeof context.rawBody !== 'string') return void 0

    if (isContentTypeFormUrlencoded(context as HttpContext)) {
      const body = parser.parse(context.rawBody)

      Object.assign(context, { body })
    }

    return void 0
  })
}
