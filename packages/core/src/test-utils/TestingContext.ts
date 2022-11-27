import { Context } from '../models/contexts/Context'

export class TestingContext extends Context {
  public handledError = (data: unknown) => this.success(data)
  public success = (data: unknown) => data
  public unhandledError = (error: unknown) => {
    throw error
  }
}
