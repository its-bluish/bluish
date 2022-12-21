/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { Binding } from '../../models/Binding'
import { ServiceBusContext } from '../../models/contexts/ServiceBusContext'
import { waitForTriggerConfiguration } from '../../tools/waitForTriggerConfiguration'
import { Fn } from '../../typings/helpers'
import { Bind } from '../Bind'
import { Trigger } from '../triggers/Trigger'
import humps from 'humps'

export type ServiceBus<I> = (...messages: I[]) => void

export function ServiceBus<I>(queueName: string, connection = 'AzureServiceBusConnectionString') {
  return (
    target: Object,
    property: string,
    maybeParameterIndexOrDescriptor?: number | TypedPropertyDescriptor<Fn>,
  ) => {
    if (typeof maybeParameterIndexOrDescriptor === 'number') {
      const key = humps.camelize(`outputServiceBusQueue_${queueName}`)

      waitForTriggerConfiguration(target, property, (triggerConfiguration) => {
        triggerConfiguration.bindings.push(
          new Binding('serviceBus', key, 'out', {
            connection,
            queueName,
          }),
        )
      })

      return Bind((context: ServiceBusContext<I>) => {
        context.azureFunctionContext.bindings[key] ??= []

        return (...messages: unknown[]) => {
          context.azureFunctionContext.bindings[key].push(...messages)
        }
      })(target, property, maybeParameterIndexOrDescriptor)
    }

    return Trigger({
      Context: ServiceBusContext,
      bindings: [
        new Binding('serviceBusTrigger', 'queueItem', 'in', {
          queueName,
          connection,
        }),
      ],
    })(target, property, maybeParameterIndexOrDescriptor)
  }
}

export namespace ServiceBus {
  export function Item() {
    return Bind((context) => {
      if (!(context instanceof ServiceBusContext)) return void 0

      return context.queueItem as unknown
    })
  }
}
