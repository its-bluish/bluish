/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import {
  ExecutionContext,
  ContextBindings,
  ContextBindingData,
  TraceContext,
  BindingDefinition,
  Logger,
} from '@azure/functions'
import { AzureFunctionContext, Binding, TriggerConfiguration } from '@bluish/core'

export class MockedAzureFunctionContext implements AzureFunctionContext {
  public invocationId = 'testing'
  public executionContext: ExecutionContext
  public bindings: ContextBindings
  public bindingData: ContextBindingData
  public traceContext: TraceContext
  public bindingDefinitions: BindingDefinition[]
  public log: Logger

  protected hasTriggerWithSameName() {
    return this.trigger.source.triggers
      .toArray()
      .some((trigger) => trigger !== this.trigger && trigger.name === this.trigger.name)
  }

  constructor(
    protected trigger: TriggerConfiguration,
    bindingIn: Binding,
    bindingOut: Binding | null,
  ) {
    this.log = Object.assign((...args: any[]) => console.log(...args), {
      error: console.error,
      info: console.info,
      warn: console.warn,
      verbose: console.log,
    })
    this.executionContext = {
      functionDirectory: trigger.source.classFilePath,
      functionName: this.hasTriggerWithSameName()
        ? `${trigger.name}_${trigger.property}`
        : trigger.name,
      invocationId: '',
      retryContext: null,
    }
    this.bindingData = {
      invocationId: '',
    }
    this.bindings = {}
    this.bindings[bindingIn.name] = bindingIn.toAzureFunctionConfiguration()
    if (bindingOut) this.bindings[bindingOut.name] = bindingOut.toAzureFunctionConfiguration()
    this.traceContext = {
      traceparent: null,
      tracestate: null,
      attributes: null,
    }
    this.bindingDefinitions = [
      bindingIn.toAzureFunctionConfiguration(),
      bindingOut?.toAzureFunctionConfiguration(),
    ].filter(<T>(defintion: T): defintion is Exclude<T, undefined> => !!defintion)
  }

  public done(err?: string | Error | null | undefined, result?: unknown): void
  public done(): void {
    return void 0
  }
}
