import { Command } from "commander";
import path from "path";
import fs from 'fs/promises'
import os from 'os'
import { DevServer } from "../models/DevServer";
import { exists } from "../tools/exists";
import { DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH } from "../constants";
import { install } from "./install";

export const start = new Command('start')

start.option('-c, --config <path>', '', 'bluish.config.ts')
start.option('-i, --input <path>', '', (value) => path.resolve(value), process.cwd())
start.option('-p, --port <port>', '', Number, 7071)
start.option('--vanilla', '', false)

const localSettingsJson = {
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}

start.action(async () => {
  const { input, config, port } = start.opts()

  if (!await exists(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH))

    await install.parseAsync(process.argv.slice(0, 2))

  const output = await fs.mkdtemp(path.join(os.tmpdir(), 'bluish-start-'))

  await fs.symlink(path.join(input, 'node_modules'), path.join(output, 'node_modules'))

  await fs.symlink(path.join(input, 'package.json'), path.join(output, 'package.json'))

  await fs.writeFile(path.join(output, 'local.settings.json'), JSON.stringify(localSettingsJson, null, 2))

  const devServer = new DevServer({ input, config, port, output })

  await devServer.start()

  process.on('uncaughtException', () => {})
  process.on('unhandledRejection', () => {})
  process.on('SIGTERM', async () => {
    await devServer.kill()
  })
})
