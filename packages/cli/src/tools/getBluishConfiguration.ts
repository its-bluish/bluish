import { Configuration } from '../interfaces/Configuration'
import { exists } from './exists'
import { _import } from './_import'

export async function getBluishConfiguration(path: string) {
  if (!(await exists(path))) return {} as unknown as Configuration

  return _import<Configuration>(path)
}
