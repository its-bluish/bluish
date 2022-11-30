export interface Configuration {
  functions: string | string[]
  application?: string
  azurite?: ConfigurationAzurite
}

export type ConfigurationAzurite =
  | boolean
  | Partial<Record<AzuriteServices, boolean | ConfigurationAzuriteServer>>

export interface ConfigurationAzuriteServer {
  host?: string
  port?: number
  start?: boolean
}

export type AzuriteServices = 'blob' | 'queue' | 'table'
