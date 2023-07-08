import { type Headers } from './Headers.js'
import { type HttpContext } from './HttpContext.js'

export abstract class Request {
  public abstract params: Record<string, unknown>

  public abstract query: Record<string, unknown>

  public abstract headers: Headers

  public abstract body: unknown

  public abstract url: URL

  constructor(public context: HttpContext) {}
}
