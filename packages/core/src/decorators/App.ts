import { IHost } from '../interfaces/IHost'
import { ApplicationConfiguration } from '../models/ApplicationConfiguration'
import { ApplicationDecorator } from '../typings/decorators'

export interface AppOptions {
  http?: {
    prefix?: string
  }
  host?: IHost
}

export function App({
  host,
  http: { prefix: httpPrefix } = {},
}: AppOptions = {}): ApplicationDecorator {
  return (target) => {
    const applicationConfiguration = ApplicationConfiguration.set(target)

    applicationConfiguration.host.set({ extensions: { http: { routePrefix: httpPrefix } } })
    applicationConfiguration.host.set(host)
  }
}
