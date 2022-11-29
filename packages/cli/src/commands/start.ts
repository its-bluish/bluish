/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable object-shorthand */
import { Command } from 'commander'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { DevServer } from '../models/DevServer'
import { exists } from '../tools/exists'
import { DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH } from '../constants'
import { install } from './install'
import { AzuriteServer } from '../models/AzuriteServer'
import { getBluishConfiguration } from '../tools/getBluishConfiguration'
import inquirer from 'inquirer'

interface StartOptions {
  config: string
  input: string
  port: number
  functions: string[]
  app?: string
  azurite: boolean
  yes: boolean
}

export const start = new Command('start')

const DEFAULT_PORT = 7071

start.description('start the bluish server')

start.usage('-p 8080 -f "./src/functions/*.ts" -a ./src/app -w')

start.option('-c, --config <path>', 'Bluish config file path')
start.option(
  '-i, --input <path>',
  'Folder where the builder will mirror to create the triggers build',
  (value) => path.resolve(value),
  process.cwd(),
)
start.option(
  '-p, --port <port>',
  'Port where the azure function server is going to run',
  Number,
  DEFAULT_PORT,
)
start.option<string[]>(
  '-f, --functions <path>',
  'glob of the files that will be compiled for triggers',
  (functionGlob, functions) => functions.concat(functionGlob),
  [],
)
start.option('-a, --app <path>', 'path of the file that will be loaded as a wrapper app')
start.option(
  '-w, --azurite',
  'starts together with the azure server the azurite servers (blob, queue, table)',
  false,
)
start.option('-y, --yes', 'say yes to all questions', false)

const localSettingsJson = {
  IsEncrypted: false,
  Values: {
    FUNCTIONS_WORKER_RUNTIME: 'node',
  } as Record<string, unknown>,
}

start.action(async () => {
  const opts = start.opts<StartOptions>()
  const { yes } = opts

  if (!(await exists(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH)))
    await install.parseAsync(process.argv.slice(0, 2))

  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-start-'))

  await fs.symlink(path.join(opts.input, 'node_modules'), path.join(output, 'node_modules'))

  await fs.symlink(path.join(opts.input, 'package.json'), path.join(output, 'package.json'))

  const configuration = await getBluishConfiguration(opts.input, opts.config)

  if (opts.app) configuration.application = opts.app

  if (opts.functions.length) configuration.functions = opts.functions

  if (opts.azurite) configuration.azurite = true

  const prompt = inquirer.createPromptModule()

  const devServer = new DevServer({ ...opts, output, configuration })

  const azuriteServer = new AzuriteServer({ prompt, yes }, configuration.azurite)

  if (azuriteServer.hasAzuriteService()) {
    await azuriteServer.start({ ...opts, output, location: '.azurite' })

    localSettingsJson.Values.AzureWebJobsStorage = azuriteServer.toAzureWebJobsStorage()
  }

  await fs.writeFile(
    path.join(output, 'local.settings.json'),
    JSON.stringify(localSettingsJson, null, 2),
  )

  await devServer.start()

  process.on('uncaughtException', () => void 0)
  process.on('unhandledRejection', () => void 0)

  process.on('SIGINT', async () => {
    await devServer.close()
    await azuriteServer.close()
    process.exit()
  })
})
