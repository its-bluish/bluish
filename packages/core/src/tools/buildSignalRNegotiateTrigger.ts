import { Bind } from '../decorators/Bind'
import { Trigger } from '../decorators/triggers/Trigger'
import { Binding } from '../models/Binding'
import {
  AzureFunctionSignalRConnectionInfo,
  _SignalRContext,
} from '../models/contexts/_SignalRContext'
import { PromiseToo } from '../typings/PromiseToo'

export function buildSignalRNegotiateTrigger(target: Function) {
  Object.defineProperty(target.prototype, '__bluishSignalRNegotiate__', {
    value: async function (
      this: Record<'onSignalRInfo', (info: AzureFunctionSignalRConnectionInfo) => PromiseToo<void>>,
      context: _SignalRContext,
    ) {
      if ('onSignalRInfo' in this) await this.onSignalRInfo(context.info)
      return context.info
    },
    configurable: false,
    writable: false,
    enumerable: false,
  })

  Trigger({
    Context: _SignalRContext,
    bindings: [
      new Binding('httpTrigger', 'req', 'in', {
        methods: ['post'],
        route: 'negotiate',
      }),
      new Binding('http', 'res', 'out'),
      new Binding('signalRConnectionInfo', 'connectionInfo', 'in', {
        hubName: 'serverless',
        connectionStringSetting: 'AzureSignalRConnectionString',
      }),
    ],
  })(
    target.prototype as Object,
    '__bluishSignalRNegotiate__',
    Object.getOwnPropertyDescriptor(target.prototype, '__bluishSignalRNegotiate__'),
  )

  Bind()(target.prototype as Object, '__bluishSignalRNegotiate__', 0)
}
