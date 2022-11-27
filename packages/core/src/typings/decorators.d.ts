import { Fn } from './helpers'

export type TriggerDecorator<F extends Fn = Fn> = (
  target: Object,
  property: string,
  descriptor?: TypedPropertyDescriptor<F>,
) => void

export type TriggerParamDecorator = (target: Object, property: string, index: number) => void

export type SourceDecorator = ClassDecorator

export type MethodDecorator<F extends Fn> = (
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
