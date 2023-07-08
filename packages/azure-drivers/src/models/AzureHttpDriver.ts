import { HttpSourceTriggerBinder } from '@bluish/http'
import { type PromiseLikeToo } from '@bluish/core'

import { AzureDriver, type BindingIn, type BindingOut } from './AzureDriver.js'

export class AzureHttpDriver extends AzureDriver<HttpSourceTriggerBinder> {
  public to(): typeof HttpSourceTriggerBinder {
    return HttpSourceTriggerBinder
  }

  private _getFunctionName(
    httpSourceTriggerBinder: HttpSourceTriggerBinder,
    useVersion = false,
  ): PromiseLikeToo<string> {
    const targetName =
      httpSourceTriggerBinder.sourceTriggerMetadata.sourceMetadata.target.name
    const propertyName =
      httpSourceTriggerBinder.sourceTriggerMetadata.propertyKey

    if (useVersion && httpSourceTriggerBinder.version)
      return `Http_${targetName}_${propertyName}_V${httpSourceTriggerBinder.version}`

    return `Http_${targetName}_${propertyName}`
  }

  protected getFunctionName(
    httpSourceTriggerBinder: HttpSourceTriggerBinder,
  ): PromiseLikeToo<string> {
    return this._getFunctionName(httpSourceTriggerBinder, true)
  }

  protected getBindingIn(
    httpSourceTriggerBinder: HttpSourceTriggerBinder,
  ): PromiseLikeToo<BindingIn> {
    if (!httpSourceTriggerBinder.route) throw new Error('TODO')

    const methods = Array.from(httpSourceTriggerBinder.methods)

    return {
      authLevel: 'anonymous',
      type: 'httpTrigger',
      name: 'req',
      methods: methods.map(method => method.toLowerCase()),
      route: httpSourceTriggerBinder.route.replace(/^\//, ''),
    }
  }

  protected getBindingOut(): PromiseLikeToo<BindingOut | BindingOut[]> {
    return { type: 'http', direction: 'out', name: 'res' }
  }

  protected getAzureRunnerImportName(): PromiseLikeToo<string> {
    return 'AzureHttpRunner'
  }

  protected getSourceTriggerMetadataPropertyKey(
    httpSourceTriggerBinder: HttpSourceTriggerBinder,
  ): PromiseLikeToo<string> {
    return httpSourceTriggerBinder.sourceTriggerMetadata.propertyKey
  }
}
