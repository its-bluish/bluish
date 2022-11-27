/* eslint-disable no-inner-declarations */
import { ApplicationConfiguration } from '../models/ApplicationConfiguration'
import { Source } from '../models/Source'
import { TriggerConfiguration } from '../models/TriggerConfiguration'

interface CoreEvents {
  source(source: Source): void
  'trigger-configuration'(triggerConfiguration: TriggerConfiguration): void
  'application-configuration'(applicationConfiguration: ApplicationConfiguration): void
}

export namespace CoreEmitter {
  const listeners: {
    [E in keyof CoreEvents]?: CoreEvents[E][]
  } = {}

  function getListenersByEvent<E extends keyof CoreEvents>(event: E): CoreEvents[E][] {
    return (listeners[event] ??= [])
  }

  export function off<E extends keyof CoreEvents>(event: E, listener: CoreEvents[E]) {
    getListenersByEvent(event).splice(getListenersByEvent(event).indexOf(listener), 1)
  }

  export function on<E extends keyof CoreEvents>(event: E, listener: CoreEvents[E]) {
    getListenersByEvent(event).push(listener)
    return () => {
      off(event, listener)
    }
  }

  export function emit<E extends keyof CoreEvents>(event: E, ...args: Parameters<CoreEvents[E]>) {
    getListenersByEvent(event)
      .slice()
      .forEach((listener) => {
        // @ts-expect-error: what??
        listener(...args)
      })
  }
}
