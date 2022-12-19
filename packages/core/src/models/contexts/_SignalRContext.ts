import { AzureFunctionContext } from './Context'
import { AzureHttpRequest, HttpContext } from './HttpContext'

export interface AzureFunctionSignalRConnectionInfo {
  accessToken: string
  url: string
}

export class _SignalRContext extends HttpContext {
  constructor(
    context: AzureFunctionContext,
    request: AzureHttpRequest,
    public info: AzureFunctionSignalRConnectionInfo,
  ) {
    super(context, request)
  }
}
