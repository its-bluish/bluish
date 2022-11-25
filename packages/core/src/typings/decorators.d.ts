import { Fn } from './helpers'

export type TriggerDecorator<F extends Fn> = (
  target: Object,
  property: string,
  descriptor?: TypedPropertyDescriptor<F>,
) => void

export type RootTriggerDecorator = ClassDecorator

export type SiblingTriggerDecorator<F extends Fn> = (
  target: Object,
  property: string,
  descriptor?: TypedPropertyDescriptor<F>,
) => void

export type ApplicationDecorator = ClassDecorator

export type ApplicationImplementarionDecorator<F extends Fn> = (
  target: Object,
  property: string,
  descriptor?: TypedPropertyDescriptor<F>,
) => void
