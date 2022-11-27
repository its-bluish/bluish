import { Context } from './contexts/Context'
import { TriggerConfiguration } from './TriggerConfiguration'

export type ArgFactory<C extends Context> = (context: C) => unknown

export class Arg<C extends Context> {
  public trigger!: TriggerConfiguration

  constructor(public factory: ArgFactory<C>) {}
}
