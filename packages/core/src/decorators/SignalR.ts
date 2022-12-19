/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable no-param-reassign */
import { Binding } from '../models/Binding'
import { waitForTriggerConfiguration } from '../tools/waitForTriggerConfiguration'
import { Bind } from './Bind'

export type SignalR = (target: string, ...args: string[]) => void

export function SignalR() {
  return (target: Object, property: string, index: number) => {
    waitForTriggerConfiguration(target, property, (triggerConfiguration) => {
      triggerConfiguration.bindings.push(
        new Binding('signalR', 'signalRMessages', 'out', {
          hubName: 'serverless',
          connectionStringSetting: 'AzureSignalRConnectionString',
        }),
      )
    })

    Bind((context) => {
      context.azureFunctionContext.bindings.signalRMessages = []

      const signalROut: SignalR = (event, ...args) => {
        context.azureFunctionContext.bindings.signalRMessages.push({
          target: event,
          arguments: args,
        })
      }

      return signalROut
    })(target, property, index)
  }
}
