import path from 'path'
import { DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH } from '../constants'
import { Spawn, SpawnArg, SpawnOptions } from './Spawn'

export class AzureServer extends Spawn {
  constructor(args: SpawnArg, options: SpawnOptions) {
    super(
      [path.join(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH, 'func'), 'start', args],
      options,
    )
  }
}
