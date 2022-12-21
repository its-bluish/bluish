import { IHost } from '../interfaces/IHost'
import { ApplicationConfiguration } from '../models/ApplicationConfiguration'
import { buildSignalRNegotiateTrigger } from '../tools/buildSignalRNegotiateTrigger'
import { ApplicationDecorator } from '../typings/decorators'

export interface AppOptions {
  http?: {
    prefix?: string
  }
  signalR?: string
  serviceBus?: string
  host?: IHost
}

export function App({
  host,
  signalR,
  serviceBus,
  http: { prefix: httpPrefix } = {},
}: AppOptions = {}): ApplicationDecorator {
  return (target) => {
    const applicationConfiguration = ApplicationConfiguration.set(target)

    applicationConfiguration.host.set({ extensions: { http: { routePrefix: httpPrefix } } })
    applicationConfiguration.host.set(host)

    if (signalR) {
      applicationConfiguration.settings.set('AzureSignalRConnectionString', signalR)
      buildSignalRNegotiateTrigger(target)
    }

    if (serviceBus) {
      applicationConfiguration.host.set({ extensions: { serviceBus: { batchOptions: {} } } })
      applicationConfiguration.settings.set('AzureServiceBusConnectionString', serviceBus)
    }
  }
}
