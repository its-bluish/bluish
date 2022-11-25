import { Trigger } from '@bluish/core'
import { TriggerBuilderCollection } from './TriggerBuilderCollection'
import fs from 'fs/promises'
import path from 'path'
import { Builder } from './Builder'
import { Configuration } from './Configuration'
import { exists } from '../tools/exists'
import { getTriggerExportName } from '../tools/getTriggerExportName'

export class TriggerBuilder {
  constructor(
    public trigger: Trigger,
    public builder: Builder,
    public configuration: Configuration,
    public collection: TriggerBuilderCollection,
  ) {}

  public get hasTriggerWithSameName() {
    return this.collection.hasTriggerWithSameName(this)
  }

  public async remove() {
    const { trigger, configuration, hasTriggerWithSameName } = this
    const dirName = hasTriggerWithSameName ? `${trigger.name}_${trigger.property}` : trigger.name

    const outDir = path.join(configuration.output, dirName)

    await fs.rm(outDir, { force: true, recursive: true })
  }

  public async build() {
    const { trigger, builder, configuration, hasTriggerWithSameName } = this
    const dirName = hasTriggerWithSameName ? `${trigger.name}_${trigger.property}` : trigger.name

    const outDir = path.join(configuration.output, dirName)

    const application =
      configuration.application &&
      path.relative(outDir, await builder.find(configuration.application))

    if (!(await exists(outDir))) await fs.mkdir(outDir)

    const triggerPath = await builder.find(trigger.metadata.classFilePath)
    const triggerExportName = getTriggerExportName(trigger)

    await fs.writeFile(
      path.join(outDir, 'index.js'),
      `
const { Runner } = require('@bluish/${trigger.runner}')
const { ${triggerExportName}: Trigger } = require('${path.relative(outDir, triggerPath)}')
${application ? `const { default: Application } = require('${application}')` : ''}

${
  application
    ? `module.exports = new Runner(Trigger, '${trigger.property}', Application).toAzureFunction()`
    : `module.exports = new Runner(Trigger, '${trigger.property}').toAzureFunction()`
}`.trim(),
      { flag: 'w' },
    )

    await fs.writeFile(
      path.join(outDir, 'function.json'),
      JSON.stringify(trigger.toAzureFunctionConfiguration(), null, 2),
      { flag: 'w' },
    )
  }
}
