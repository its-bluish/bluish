import { Context, HttpContext, Plugin } from "@bluish/core";
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

  public isContentTypeFormUrlencoded(context: HttpContext) {
    return is(context.headers['content-type'], 'application/x-www-form-urlencoded')
  }

  public getParser() {
    if (this.extended) return import('qs')
    return import('querystring')
  }

  public override async onInitialize(context: Context) {
    if (!(context instanceof HttpContext)) return void 0

    const parser = await this.getParser()

    const { search } = new URL(context.url)
    const query = parser.parse(search.replace(/^\?/, ''))

    context.query = query

    if (this.isContentTypeFormUrlencoded(context))

      context.body = parser.parse(context.rawBody)
  }
}
