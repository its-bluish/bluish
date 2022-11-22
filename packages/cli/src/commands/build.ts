import { Command } from 'commander'
import path from 'path'
import fs from 'fs/promises'
import { exists } from '../tools/exists'
import { Configuration } from '../models/Configuration'
import { TriggerBuilderCollection } from '../models/TriggerBuilderCollection'
import { glob } from '../tools/glob'
import { _import } from '../tools/_import'

export const build = new Command('build')

build.option('-c, --config <path>', '', 'bluish.config.ts')
build.option('-o, --output <path>', '', 'dist')
build.option('-i, --input <path>', '', (value) => path.resolve(value), process.cwd())

build.action(async () => {
  const opts = build.opts()

  const configuration = await Configuration.from(opts.input, opts.config, path.resolve(opts.input, opts.output))

  if (await exists(configuration.output)) await fs.rm(configuration.output, { force: true, recursive: true })

  await fs.mkdir(configuration.output)

  const builder = await configuration.createBuilder()

  await builder.build()

  const modulesPaths = await glob(configuration.globs, { cwd: opts.input })

  const modules = await Promise.all(
    modulesPaths
      .map(constructorPath => path.join(opts.input, constructorPath))
      .map(constructorPath => _import<Record<string, Function>>(constructorPath, true))
  )

  const triggersBuilder = new TriggerBuilderCollection(builder, configuration)

  await Promise.all(modules.map(module => triggersBuilder.addByModuleExportAndBuild(module)))
})
