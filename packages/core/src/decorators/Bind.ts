import { Context } from '../models/contexts/Context'
import { Arg, ArgFactory } from '../models/Arg'
import { waitForTriggerConfiguration } from '../tools/waitForTriggerConfiguration'

export function Bind<C extends Context>(factory: ArgFactory<C> = (context) => context) {
  return (target: Object, property: string, index: number) => {
    waitForTriggerConfiguration(target, property, (triggerConfiguration) => {
      triggerConfiguration.args.set(index, new Arg<C>(factory) as Arg<Context>)
    })
  }
}
