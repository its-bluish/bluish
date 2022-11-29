export interface Configuration {
  functions: string | string[]
  application?: string
  azurite?: ConfigurationAzurite
}

export type ConfigurationAzurite =
  | boolean
  | Record<AzuriteServers, boolean | ConfigurationAzuriteServer>

export interface ConfigurationAzuriteServer {
  host?: string
  port?: number
  start?: boolean
}

export type AzuriteServers = 'blob' | 'queue' | 'table'
