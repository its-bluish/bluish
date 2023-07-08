import { type HttpContext } from './HttpContext.js'

export abstract class Response {
  public abstract status: number

  public abstract headers: Record<string, unknown>

  public abstract body: unknown

  constructor(public context: HttpContext) {}
}
