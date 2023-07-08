import fs from 'fs/promises'
import path from 'path'

import { Frame } from '@bluish/core'

export class AzureLocalSettingsFrame extends Frame {
  public async up(): Promise<void> {
    await fs.writeFile(
      path.resolve(this.outputDirectory, 'local.settings.json'),
      JSON.stringify(
        {
          IsEncrypted: false,
          Values: {
            FUNCTIONS_WORKER_RUNTIME: 'node',
            AzureWebJobsFeatureFlags: 'EnableWorkerIndexing',
            AzureWebJobsStorage: '',
          },
        },
        null,
        2,
      ),
    )
  }
}
