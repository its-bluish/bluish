import { Middleware } from '../models/Middleware.js'
import { Use, type UseDecorator } from './Use.js'

class OnInitializeMiddleware extends Middleware {
  constructor(onInitialize: NonNullable<Middleware['onInitialize']>) {
    super()
    this.onInitialize = onInitialize
  }
}

export function OnInitialize(
  onInitialize: NonNullable<Middleware['onInitialize']>,
): UseDecorator {
  return Use(new OnInitializeMiddleware(onInitialize))
}
