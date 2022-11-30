import { Command } from 'commander'
import path from 'path'
import fs from 'fs/promises'
import { exists } from '../tools/exists'
import { Configuration } from '../models/Configuration'
import { TriggerBuilderCollection } from '../models/TriggerBuilderCollection'
import { glob } from '../tools/glob'
import { _import } from '../tools/_import'
import { getBluishConfiguration } from '../tools/getBluishConfiguration'

interface BuildOptions {
  config: string
  input: string
  output: string
  functions: string[]
  app?: string
}

export const build = new Command('build')

build.option('-c, --config <path>', 'Bluish config file path')
build.option(
  '-i, --input <path>',
  'Folder where the builder will mirror to create the triggers build',
  (value) => path.resolve(value),
  process.cwd(),
)
build.option('-o, --output <path>', 'Folder that will be the target of the triggers', 'dist')
build.option<string[]>(
  '-f, --functions <path>',
  'glob of the files that will be compiled for triggers',
  (functionGlob, functions) => functions.concat(functionGlob),
  [],
)
build.option('-a, --app <path>', 'path of the file that will be loaded as a wrapper app')

build.action(async () => {
  const opts = build.opts<BuildOptions>()

  const bluishConfiguration = await getBluishConfiguration(opts.input, opts.config)

  if (opts.app) bluishConfiguration.application = opts.app

  if (opts.functions.length) bluishConfiguration.functions = opts.functions

  const configuration = new Configuration(opts, bluishConfiguration)

  if (await exists(configuration.output))
    await fs.rm(configuration.output, { force: true, recursive: true })

  await fs.mkdir(configuration.output)

  const builder = await configuration.createBuilder()

  await builder.build()

  const modulesPaths = await glob(configuration.globs, { cwd: opts.input })

  const modules = await Promise.all(
    modulesPaths
      .map((constructorPath) => path.join(opts.input, constructorPath))
      .map(async (constructorPath) => _import<Record<string, Function>>(constructorPath, true)),
  )

  const triggersBuilder = new TriggerBuilderCollection(builder, configuration)

  await Promise.all(
    modules.map(async (module) => triggersBuilder.addByModuleExportAndBuild(module)),
  )
})
