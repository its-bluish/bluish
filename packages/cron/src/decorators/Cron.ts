import { getSourceMetadata } from '@bluish/core'

export function Cron(pattern: string) {
  return (target: Object, propertyKey: string) => {
    getSourceMetadata(target.constructor)
      .getSourceTriggerMetadata(propertyKey)
      .useBinder('cron').pattern = pattern
  }
}
