import { IHost } from '../interfaces/IHost'
import { ApplicationMetadata } from '../models/metadata/Application'

export interface AppConfig {
  http?: {
    prefix?: string
  }
  host?: IHost
}

export const App = ({ host, http: { prefix: httpPrefix } = {} }: AppConfig = {}): ClassDecorator => {
  return (target) => {
    const applicationMetadata = ApplicationMetadata.set(target)

    applicationMetadata.host.set({ extensions: { http: { routePrefix: httpPrefix } } })
    applicationMetadata.host.set(host)
  }
}
