/* eslint-disable prefer-named-capture-group */
/* eslint-disable max-lines-per-function */
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
}

export const start = new Command('start')

const DEFAULT_PORT = 7071

start.option('-c, --config <path>', '', 'bluish.config.ts')
start.option('-i, --input <path>', '', (value) => path.resolve(value), process.cwd())
start.option('-p, --port <port>', '', Number, DEFAULT_PORT)
start.option<string[]>(
  '-f, --functions <path>',
  '',
  (functionGlob, functions) => functions.concat(functionGlob),
  [],
)
start.option('-a, --app <path>', '')
start.option('-w, --azurite', '', false)

const localSettingsJson = {
  IsEncrypted: false,
  Values: {
    FUNCTIONS_WORKER_RUNTIME: 'node',
  } as Record<string, unknown>,
}

start.action(async () => {
  const opts = start.opts<StartOptions>()

  if (!(await exists(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH)))
    await install.parseAsync(process.argv.slice(0, 2))

  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-start-'))

  await fs.symlink(path.join(opts.input, 'node_modules'), path.join(output, 'node_modules'))

  await fs.symlink(path.join(opts.input, 'package.json'), path.join(output, 'package.json'))

  const configuration = await getBluishConfiguration(path.join(opts.input, opts.config))

  if (opts.app) configuration.application = opts.app

  if (opts.functions.length) configuration.functions = opts.functions

  if (opts.azurite) configuration.azurite = true

  const prompt = inquirer.createPromptModule()

  const devServer = new DevServer({ ...opts, output, configuration })

  const azuriteServer = new AzuriteServer(configuration.azurite, prompt)

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
