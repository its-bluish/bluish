import fs from 'fs'
import path from 'path'

import {
  Driver,
  type SourceTriggerBinder,
  type PromiseLikeToo,
  type DriverSourceImportDetails,
} from '@bluish/core'
import '@bluish/http'

export interface BindingIn {
  type: string
  name: string
  [key: string]: unknown
}

export interface BindingOut {
  type: string
  name: string
  [key: string]: unknown
}

export abstract class AzureDriver<
  T extends SourceTriggerBinder,
> extends Driver<T> {
  protected abstract getFunctionName(
    SourceTriggerBinder: T,
  ): PromiseLikeToo<string>

  protected abstract getBindingIn(
    SourceTriggerBinder: T,
  ): PromiseLikeToo<BindingIn>

  protected abstract getAzureRunnerImportName(
    SourceTriggerBinder: T,
  ): PromiseLikeToo<string>

  protected getAzureRunnerPackageName(
    SourceTriggerBinder: T,
  ): PromiseLikeToo<string> {
    return '@bluish/azure-runners'
  }

  protected abstract getSourceTriggerMetadataPropertyKey(
    SourceTriggerBinder: T,
  ): PromiseLikeToo<string>

  protected getBindingOut(
    SourceTriggerBinder: T,
  ): PromiseLikeToo<BindingOut | BindingOut[]> {
    return []
  }

  protected async getBindings(
    SourceTriggerBinder: T,
  ): Promise<Array<BindingIn | BindingOut>> {
    const [bindingIn, bindingOutOrbindingOuts] = await Promise.all([
      this.getBindingIn(SourceTriggerBinder),
      this.getBindingOut(SourceTriggerBinder),
    ])

    const bindingOuts = Array.isArray(bindingOutOrbindingOuts)
      ? bindingOutOrbindingOuts
      : [bindingOutOrbindingOuts]

    return [
      { direction: 'in', ...bindingIn },
      ...bindingOuts.map(bindingOut => ({ direction: 'out', ...bindingOut })),
    ]
  }

  public async up(
    sourceTriggerBinder: T,
    importDetails: DriverSourceImportDetails,
  ): Promise<void> {
    const [
      functionName,
      azureRunnerPackageExportName,
      azureRunnerPackageName,
      propertyKey,
    ] = await Promise.all([
      this.getFunctionName(sourceTriggerBinder),
      this.getAzureRunnerImportName(sourceTriggerBinder),
      this.getAzureRunnerPackageName(sourceTriggerBinder),
      this.getSourceTriggerMetadataPropertyKey(sourceTriggerBinder),
    ])

    await fs.promises.mkdir(path.join(this.outputDirectory, functionName), {
      recursive: true,
    })

    await fs.promises.writeFile(
      path.join(this.outputDirectory, functionName, 'function.json'),
      JSON.stringify(
        {
          bindings: await this.getBindings(sourceTriggerBinder),
        },
        null,
        2,
      ),
      'utf-8',
    )

    await fs.promises.writeFile(
      path.join(this.outputDirectory, functionName, 'index.js'),
      `
import { ${azureRunnerPackageExportName} } from '${azureRunnerPackageName}'
import { ${importDetails.key} } from '${path.relative(
        path.join(this.outputDirectory, functionName),
        importDetails.path,
      )}'
${
  this.hasApplication
    ? `import ${this.applicationExportAlias} from '${path.relative(
        path.join(this.outputDirectory, functionName),
        this.applicationPath,
      )}'`
    : ''
}

export default new ${azureRunnerPackageExportName}(${
        importDetails.key
      }, '${propertyKey}', ${
        this.hasApplication ? this.applicationExportAlias : 'null'
      }).toHandle()
    `.trim(),
    )
  }

  public async down(
    sourceTriggerBinder: T,
    importDetails: DriverSourceImportDetails,
  ): Promise<void> {
    const functionName = await this.getFunctionName(sourceTriggerBinder)

    fs.rmSync(path.join(this.outputDirectory, functionName), {
      force: true,
      recursive: true,
    })
  }

  public async refresh(
    binder: T,
    older: T,
    importDetails: DriverSourceImportDetails,
  ): Promise<void> {}
}
