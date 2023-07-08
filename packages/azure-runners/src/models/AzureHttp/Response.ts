import { Response } from '@bluish/http'

export class AzureHttpResponse extends Response {
  public status!: number

  public headers: Record<string, unknown> = {}

  public body: unknown
}
