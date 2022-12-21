import fs from 'fs/promises'
import path from 'path'
import { Configuration } from '../interfaces/Configuration'
import { exists } from './exists'
import { glob } from './glob'
import { _import } from './_import'

export async function getBluishConfiguration(dir: string, config?: string) {
  if (config) {
    const fullpath = path.resolve(dir, config)

    if (!(await exists(fullpath)))
      throw new Error(`There is no bluish configuration file '${config}'`)

    return _import<Configuration>(fullpath)
  }

  const files = await glob([
    path.join(dir, 'bluish.config.{ts,js,json}'),
    path.join(dir, 'bluishrc{.{ts,js,json},}'),
  ])

  if (!files.length) return {} as unknown as Configuration

  const [file] = files

  if (file.endsWith('rc')) return JSON.parse(await fs.readFile(file, 'utf-8')) as Configuration

  return _import<Configuration>(file)
}
