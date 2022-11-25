import { IHost } from '../interfaces/IHost'
import { ApplicationMetadata } from '../models/metadata/Application'
import { ApplicationDecorator } from '../typings/decorators'

export interface AppConfig {
  http?: {
    prefix?: string
  }
  host?: IHost
}

export function App({
  host,
  http: { prefix: httpPrefix } = {},
}: AppConfig = {}): ApplicationDecorator {
  return (target) => {
    const applicationMetadata = ApplicationMetadata.set(target)

    applicationMetadata.host.set({ extensions: { http: { routePrefix: httpPrefix } } })
    applicationMetadata.host.set(host)
  }
}
