import { Context, AzureFunctionContext } from './Context'

export class ServiceBusContext<I> extends Context {
  constructor(azureFunctionContext: AzureFunctionContext, public queueItem: I) {
    super(azureFunctionContext)
  }

  public success() {
    /** void */
  }

  public unhandledError(error: unknown): unknown {
    throw error
  }

  public handledError() {
    /** void */
  }
}
