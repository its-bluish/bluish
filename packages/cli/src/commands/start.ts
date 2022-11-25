import { Command } from 'commander'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { DevServer } from '../models/DevServer'
import { exists } from '../tools/exists'
import { DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH } from '../constants'
import { install } from './install'

interface StartOptions {
  config: string
  input: string
  port: number
}

export const start = new Command('start')

const DEFAULT_PORT = 7071

start.option('-c, --config <path>', '', 'bluish.config.ts')
start.option('-i, --input <path>', '', (value) => path.resolve(value), process.cwd())
start.option('-p, --port <port>', '', Number, DEFAULT_PORT)
start.option('--vanilla', '', false)

const localSettingsJson = {
  IsEncrypted: false,
  Values: {
    AzureWebJobsStorage: '',
    FUNCTIONS_WORKER_RUNTIME: 'node',
  },
}

start.action(async () => {
  const { input, config, port } = start.opts<StartOptions>()

  if (!(await exists(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH)))
    await install.parseAsync(process.argv.slice(0, 2))

  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-start-'))

  await fs.symlink(path.join(input, 'node_modules'), path.join(output, 'node_modules'))

  await fs.symlink(path.join(input, 'package.json'), path.join(output, 'package.json'))

  await fs.writeFile(
    path.join(output, 'local.settings.json'),
    JSON.stringify(localSettingsJson, null, 2),
  )

  const devServer = new DevServer({ input, config, port, output })

  await devServer.start()

  process.on('uncaughtException', () => void 0)
  process.on('unhandledRejection', () => void 0)
  process.on('SIGTERM', () => void devServer.kill())
})
