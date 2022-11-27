import { TriggerConfiguration } from '@bluish/core'
import { MODULE_EXPORT_NAME } from '../constants'

export function getTriggerExportName(trigger: TriggerConfiguration) {
  const target = trigger.source.target as Function & { [MODULE_EXPORT_NAME]: string }

  return target[MODULE_EXPORT_NAME]
}
