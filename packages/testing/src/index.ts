import { Source, Runner } from '@bluish/core'
import { HttpMethod } from '@bluish/core/dist/models/contexts/HttpContext'
import { MockedAzureFunctionContext } from './helpers/MockedAzureFunctionContext'
import { MockedAzureHttpRequestOptions } from './helpers/MockedAzureHttpRequest'
import {
  MockedEventGridContext,
  MockedEventGridContextPayload,
} from './helpers/MockedEventGridContext'
import { MockedHttpContext } from './helpers/MockedHttpContext'
import { MockedTimerContext } from './helpers/MockedTimerContext'

type RunType = 'http' | 'timer' | 'event-grid'

interface RunContextMapByType {
  http: MockedHttpContext
  timer: MockedTimerContext
  'event-grid': MockedEventGridContext
}

interface RunOptionsMapByType {
  http: MockedAzureHttpRequestOptions
  timer: null
  'event-grid': MockedEventGridContextPayload
}

export async function run<I, K extends keyof I & string, T extends RunType>(
  target: new () => I,
  key: K,
  type: T,
  payload?: RunOptionsMapByType[T],
): Promise<RunContextMapByType[T]> {
  const source = Source.getOrFail(target)

  const trigger = source.triggers.findOneByPropertyOrFail(key)

  if (trigger.bindings.findByDirection('in').length > 1) throw new Error('TODO')
  if (trigger.bindings.findByDirection('out').length > 1) throw new Error('TODO')

  const bindingIn = trigger.bindings.findOneByDirectionOrFail('in')
  const bindingOut = trigger.bindings.findOneByDirection('out')

  const runner = new Runner(target, key)

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

  return context as unknown as RunContextMapByType[T]
}

function factoryRunHttpByMethod(method: Lowercase<HttpMethod>) {
  return async <I, K extends keyof I & string>(
    target: new () => I,
    key: K,
    payload?: Omit<RunOptionsMapByType['http'], 'method'>,
  ) => run.http(target, key, { ...payload, method })
}

run.http = Object.assign(
  async <I, K extends keyof I & string>(
    target: new () => I,
    key: K,
    payload?: RunOptionsMapByType['http'],
  ) => run(target, key, 'http', payload),
  {
    get: factoryRunHttpByMethod('get'),
    post: factoryRunHttpByMethod('post'),
    delete: factoryRunHttpByMethod('delete'),
    head: factoryRunHttpByMethod('head'),
    patch: factoryRunHttpByMethod('patch'),
    put: factoryRunHttpByMethod('put'),
    options: factoryRunHttpByMethod('options'),
    trace: factoryRunHttpByMethod('trace'),
    connect: factoryRunHttpByMethod('connect'),
  },
)

run.timer = async <I, K extends keyof I & string>(
  target: new () => I,
  key: K,
  payload?: RunOptionsMapByType['timer'],
) => run(target, key, 'timer', payload)
