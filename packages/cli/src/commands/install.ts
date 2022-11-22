import { Command } from "commander";
import { exists } from "../tools/exists";
import https from 'https'
import { Presets, SingleBar } from 'cli-progress'
import unzipper from 'unzipper'
import fs from 'fs/promises'
import { DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH, MICROSOFT_AZURE_FUNCTIONS_CDN_ENDPOINT } from "../constants";

export const install = new Command('install')

install.option('-f, --force', '', false)

install.action(async () => {
  const { force } = install.opts()

  const installPathExists = await exists(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH)

  if (installPathExists && !force) return void 0

  if (!installPathExists) await fs.mkdir(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH, { recursive: true })

  const progress = new SingleBar({}, Presets.shades_classic);

  await new Promise((resolve, reject) => {
    https.get(MICROSOFT_AZURE_FUNCTIONS_CDN_ENDPOINT, response => {
      const contentLength = Number(response.headers['content-length'])
      progress.start(contentLength, 0)

      response.on('data', data => progress.increment(data.length))
        .pipe(unzipper.Extract({ path: DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH }))
        .on('close', resolve)
    }).on('error', reject)
  })

  progress.stop()

  await fs.chmod(`${DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH}/func`, 0o755);
  await fs.chmod(`${DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH}/gozip`, 0o755);
})