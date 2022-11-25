import { Trigger } from '@bluish/core'
import { MODULE_EXPORT_NAME } from '../constants'

export function getTriggerExportName(trigger: Trigger) {
  const target = trigger.metadata.target as Function & { [MODULE_EXPORT_NAME]: string }

  return target[MODULE_EXPORT_NAME]
}
