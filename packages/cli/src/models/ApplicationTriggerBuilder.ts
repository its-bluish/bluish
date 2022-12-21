import fs from 'fs/promises'
import path from 'path'
import { exists } from '../tools/exists'
import { TriggerBuilder } from './TriggerBuilder'
import humps from 'humps'

export class ApplicationTriggerBuilder extends TriggerBuilder {
  public override async build() {
    const { trigger, builder, configuration } = this
    const dirName = humps.pascalize(`${trigger.name}_${trigger.property}`)

    const outDir = path.join(configuration.output, dirName)

    if (!configuration.application) throw new Error('There is no path to the application')

    const application = path.relative(outDir, await builder.find(configuration.application))

    if (!(await exists(outDir))) await fs.mkdir(outDir)

    await fs.writeFile(
      path.join(outDir, 'index.js'),
      `
const { default: Application } = require('${application}')
const { Runner } = require('${trigger.runner}')

module.exports = new Runner(Application, '${trigger.property}').toAzureFunction()`.trim(),
      { flag: 'w' },
    )

    await fs.writeFile(
      path.join(outDir, 'function.json'),
      JSON.stringify(trigger.toAzureFunctionConfiguration(), null, 2),
      { flag: 'w' },
    )
  }
}
