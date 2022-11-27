/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { Plugin } from '../models/Plugin'
import { Fn } from '../typings/helpers'
import { waitForTriggerConfiguration } from '../tools/waitForTriggerConfiguration'
import { waitForSourceOrApplicationConfiguration } from '../tools/waitForSourceOrApplicationConfiguration'

export type UseDecorator = (
  target: Function | Object,
  property?: string,
  descriptor?: TypedPropertyDescriptor<Fn>,
) => void

export function Use(plugin: Plugin): UseDecorator {
  return (target: Function | Object, property?: string) => {
    if (property)
      return waitForTriggerConfiguration(target, property, (triggerConfiguration) => {
        triggerConfiguration.plugins.push(plugin)
      })

    return waitForSourceOrApplicationConfiguration(target, (sourceOrApplicationConfiguration) => {
      sourceOrApplicationConfiguration.plugins.push(plugin)
    })
  }
}
