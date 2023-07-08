import { SourceTriggerMetadata, type SourceTriggerBinder } from '@bluish/core'

export class CronSourceTriggerBinder implements SourceTriggerBinder {
  public pattern!: string

  constructor(public sourceTriggerMetadata: SourceTriggerMetadata) {}
}

SourceTriggerMetadata.binders.cron = sourceTriggerMetadata =>
  new CronSourceTriggerBinder(sourceTriggerMetadata)

declare global {
  namespace Bluish {
    interface SourceTriggerBinders {
      cron: CronSourceTriggerBinder
    }
  }
}
