import { AzuriteServices } from '../interfaces/Configuration'
import { Spawn, SpawnOptions } from './Spawn'

export interface AzuriteServiceOptions {
  port: number
  host: string
  location?: string
}

export class AzuriteService extends Spawn {
  constructor(
    key: AzuriteServices,
    { host, port, location }: AzuriteServiceOptions,
    options?: SpawnOptions,
  ) {
    super(
      [
        'npx',
        `azurite-${key}`,
        {
          [`${key}Port`]: port,
          [`${key}Host`]: host,
        },
        { location },
      ],
      options,
    )
  }
}
