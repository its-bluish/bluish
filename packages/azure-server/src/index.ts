import https from 'https'
import fs from 'fs/promises'
import path from 'path'

import byteSize from 'byte-size'
import {
  Server,
  ProgressIncrementEvent,
  ProgressStartEvent,
  ProgressEndEvent,
  Spawn,
  LogTextEvent,
} from '@bluish/cli'
import unzipper from 'unzipper'

import { fsPromiseExists } from './fsPromiseExists.js'
import {
  DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH,
  MICROSOFT_AZURE_FUNCTIONS_CDN_ENDPOINT,
} from './constants.js'

class AzureServer extends Server {
  protected server: Spawn | null = null

  public readonly name = 'Azure Function'

  protected async install(): Promise<void> {
    await new Promise((resolve, reject) => {
      https
        .get(MICROSOFT_AZURE_FUNCTIONS_CDN_ENDPOINT, response => {
          const contentLength = Number(response.headers['content-length'])

          void this.emit(
            new ProgressStartEvent({
              total: contentLength,
              identifier: 'download-azure-binary',
              label: (current, total) => {
                const currentLabel = byteSize.default(current).toString()
                const totalLabel = byteSize.default(total).toString()

                return `Azure Function Core Tools [${currentLabel}/${totalLabel}]`
              },
            }),
          )

          response
            .on('data', (data: string) => {
              void this.emit(
                new ProgressIncrementEvent(
                  'download-azure-binary',
                  data.length,
                ),
              )
            })
            .pipe(
              unzipper.Extract({
                path: DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH,
              }),
            )
            .on('close', resolve)
        })
        .on('error', reject)
    })

    await this.emit(new ProgressEndEvent('download-azure-binary'))

    await Promise.all([
      fs.chmod(`${DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH}/func`, 0o755),
      fs.chmod(`${DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH}/gozip`, 0o755),
    ])
  }

  async start(): Promise<void> {
    if (!(await fsPromiseExists(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH)))
      await this.install()

    this.server = new Spawn(
      [
        path.join(DEFAULT_INSTALL_AZURE_FUNCTIONS_BINARIES_PATH, 'func'),
        'start',
        { port: 8080, verbose: true },
      ],
      {
        cwd: this.configuration.outputDirectory,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    this.server.process?.stdio[1]?.on('data', (chunk: Buffer) => {
      void this.emit(new LogTextEvent(chunk.toString('utf-8')))
    })
  }

  stop(): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export default AzureServer
