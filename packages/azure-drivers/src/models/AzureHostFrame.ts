import fs from 'fs/promises'
import path from 'path'

import { Frame } from '@bluish/core'

export class AzureHostFrame extends Frame {
  public async up(): Promise<void> {
    await fs.writeFile(
      path.resolve(this.outputDirectory, 'host.json'),
      JSON.stringify(
        {
          version: '2.0',
          extensionBundle: {
            id: 'Microsoft.Azure.Functions.ExtensionBundle',
            version: '[3.15.0, 4.0.0)',
          },
          extensions: {
            http: { routePrefix: '' },
          },
        },
        null,
        2,
      ),
    )
  }
}
