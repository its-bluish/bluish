import { type PromiseLikeToo } from '@bluish/core'
import { CronSourceTriggerBinder } from '@bluish/cron'

import { AzureDriver, type BindingIn } from './AzureDriver.js'

export class AzureTimerDriver extends AzureDriver<CronSourceTriggerBinder> {
  public to(): typeof CronSourceTriggerBinder {
    return CronSourceTriggerBinder
  }

  protected getFunctionName(
    cronSourceTriggerBinder: CronSourceTriggerBinder,
  ): PromiseLikeToo<string> {
    const targetName =
      cronSourceTriggerBinder.sourceTriggerMetadata.sourceMetadata.target.name
    const propertyName =
      cronSourceTriggerBinder.sourceTriggerMetadata.propertyKey

    return `Cron_${targetName}_${propertyName}`
  }

  protected getBindingIn(
    cronSourceTriggerBinder: CronSourceTriggerBinder,
  ): PromiseLikeToo<BindingIn> {
    return {
      schedule: cronSourceTriggerBinder.pattern,
      name: 'cron',
      type: 'timerTrigger',
    }
  }

  protected getAzureRunnerImportName(
    cronSourceTriggerBinder: CronSourceTriggerBinder,
  ): PromiseLikeToo<string> {
    return 'AzureTimerRunner'
  }

  protected getSourceTriggerMetadataPropertyKey(
    cronSourceTriggerBinder: CronSourceTriggerBinder,
  ): PromiseLikeToo<string> {
    return cronSourceTriggerBinder.sourceTriggerMetadata.propertyKey
  }
}
