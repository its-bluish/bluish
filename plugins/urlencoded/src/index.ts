import { Context, HttpContext, Plugin } from '@bluish/core'
import { HttpTemplate } from '@bluish/core/dist/models/contexts/HttpContext'
import { is } from 'type-is'

export interface BluishUrlencodedPluginOptions {
  extended?: boolean
}

export default class BluishUrlencodedPlugin extends Plugin {
  public readonly extended: boolean

  constructor({ extended = false }: BluishUrlencodedPluginOptions) {
    super()
    this.extended = extended
  }

  public static isContentTypeFormUrlencoded<T extends Partial<HttpTemplate>>(
    context: HttpContext<T>,
  ): string | false {
    return is(context.headers['content-type'], 'application/x-www-form-urlencoded')
  }

  public async getParser(): Promise<typeof import('qs') | typeof import('querystring')> {
    if (this.extended) return import('qs')
    return import('querystring')
  }

  public override async onInitialize(context: Context): Promise<void> {
    if (!(context instanceof HttpContext)) return void 0

    const parser = await this.getParser()

    const { search } = new URL(context.url)
    const query = parser.parse(search.replace(/^\?/, ''))

    Object.assign(context, { query })

    if (typeof context.rawBody !== 'string') return void 0

    if (!(context instanceof HttpContext)) return void 0

    if (BluishUrlencodedPlugin.isContentTypeFormUrlencoded(context)) {
      const body = parser.parse(context.rawBody)

      Object.assign(context, { body })
    }

    return void 0
  }
}
