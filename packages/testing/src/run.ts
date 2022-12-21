/* eslint-disable no-inner-declarations */
import { Source, Runner } from '@bluish/core'
import { HttpMethod } from '@bluish/core/dist/models/contexts/HttpContext'
import { configure } from './configure'
import { MockedAzureFunctionContext } from './helpers/MockedAzureFunctionContext'
import { MockedAzureHttpRequestOptions } from './helpers/MockedAzureHttpRequest'
import {
  MockedEventGridContext,
  MockedEventGridContextPayload,
} from './helpers/MockedEventGridContext'
import { MockedHttpContext } from './helpers/MockedHttpContext'
import { MockedTimerContext } from './helpers/MockedTimerContext'

export async function run<
  K extends keyof I & string,
  I extends Record<K, (...args: any[]) => unknown>,
  T extends run.Types,
>(target: new () => I, key: K, type: T, payload?: run.PayloadMap[T]): Promise<run.ContextMap[T]> {
  const source = Source.getOrFail(target)

  const trigger = source.triggers.findOneByPropertyOrFail(key)

  if (trigger.bindings.findByDirection('in').length > 1) throw new Error('TODO')
  if (trigger.bindings.findByDirection('out').length > 1) throw new Error('TODO')

  const bindingIn = trigger.bindings.findOneByDirectionOrFail('in')
  const bindingOut = trigger.bindings.findOneByDirection('out')

  const runner = new Runner(target, key, configure.getApp())

  const mockedAzureFunctionContext = new MockedAzureFunctionContext(trigger, bindingIn, bindingOut)

  const context = (() => {
    switch (bindingIn.type) {
      case 'httpTrigger':
        if (type !== 'http') throw new Error('TODO')

        return new MockedHttpContext(
          bindingIn,
          mockedAzureFunctionContext,
          payload as MockedAzureHttpRequestOptions,
        )
      case 'eventGridTrigger':
        if (type !== 'event-grid') throw new Error('TODO')

        return new MockedEventGridContext(
          mockedAzureFunctionContext,
          payload as MockedEventGridContextPayload,
        )
      case 'timerTrigger':
        if (type !== 'timer') throw new Error('TODO')

        return new MockedTimerContext(bindingIn, mockedAzureFunctionContext)
      default:
        throw new Error('TODO')
    }
  })()

  await runner.runWithContext(context)

  return context as unknown as run.ContextMap[T]
}

export namespace run {
  export type Types = 'http' | 'timer' | 'event-grid'

  export interface ContextMap {
    http: MockedHttpContext
    timer: MockedTimerContext
    'event-grid': MockedEventGridContext
  }

  export interface PayloadMap {
    http: MockedAzureHttpRequestOptions
    timer: null
    'event-grid': MockedEventGridContextPayload
  }

  export async function http<
    K extends keyof I & string,
    I extends Record<K, (...args: any[]) => unknown>,
  >(target: new () => I, key: K, payload?: PayloadMap['http']) {
    return run(target, key, 'http', payload)
  }

  function httpFactoryByMethod(method: Lowercase<HttpMethod>) {
    return async <K extends keyof I & string, I extends Record<K, (...args: any[]) => unknown>>(
      target: new () => I,
      key: K,
      payload?: Omit<PayloadMap['http'], 'method'>,
    ) => http(target, key, { ...payload, method })
  }

  export namespace http {
    export const get = httpFactoryByMethod('get')
    export const post = httpFactoryByMethod('post')
    export const head = httpFactoryByMethod('head')
    export const patch = httpFactoryByMethod('patch')
    export const put = httpFactoryByMethod('put')
    export const options = httpFactoryByMethod('options')
    export const trace = httpFactoryByMethod('trace')
    export const connect = httpFactoryByMethod('connect')
  }

  http.delete = httpFactoryByMethod('delete')

  export async function timer<
    K extends keyof I & string,
    I extends Record<K, (...args: any[]) => unknown>,
  >(target: new () => I, key: K, payload?: PayloadMap['timer']) {
    return run(target, key, 'timer', payload)
  }
}
