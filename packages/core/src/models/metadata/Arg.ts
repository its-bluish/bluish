import { Context } from '../contexts/Context'
import { Trigger } from './Trigger'

export type ArgFactory<C extends Context> = (context: C) => unknown

export class Arg<C extends Context> {
  public trigger!: Trigger

  constructor(public factory: ArgFactory<C>) {}
}
