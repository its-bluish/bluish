/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { CoreEmitter } from '../helpers/CoreEmitter'
import { Source } from '../models/Source'
import { TriggerConfiguration } from '../models/TriggerConfiguration'

export function waitForTriggerConfiguration(
  target: Function | Object,
  property: string,
  callback: (triggerConfiguration: TriggerConfiguration) => void,
) {
  const constructor = typeof target === 'function' ? target : target.constructor

  const source = Source.get(target)

  if (source?.triggers.hasTriggerWithProperty(property))
    return callback(source.triggers.findOneByPropertyOrFail(property))

  const remove = CoreEmitter.on('trigger-configuration', (configuration) => {
    if (configuration.source.target !== constructor) return void 0

    if (configuration.property !== property) return void 0

    remove()

    return callback(configuration)
  })

  return void 0
}
