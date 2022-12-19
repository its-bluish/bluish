import { IHost } from '../interfaces/IHost'
import { ApplicationConfiguration } from '../models/ApplicationConfiguration'
import { buildSignalRNegotiateTrigger } from '../tools/buildSignalRNegotiateTrigger'
import { ApplicationDecorator } from '../typings/decorators'

export interface AppOptions {
  http?: {
    prefix?: string
  }
  signalr?: string
  host?: IHost
}

export function App({
  host,
  signalr,
  http: { prefix: httpPrefix } = {},
}: AppOptions = {}): ApplicationDecorator {
  return (target) => {
    const applicationConfiguration = ApplicationConfiguration.set(target)

    applicationConfiguration.host.set({ extensions: { http: { routePrefix: httpPrefix } } })
    applicationConfiguration.host.set(host)

    if (signalr) {
      applicationConfiguration.settings.set('AzureSignalRConnectionString', signalr)
      buildSignalRNegotiateTrigger(target)
    }
  }
}
