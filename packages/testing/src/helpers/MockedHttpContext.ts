import { Binding, HttpContext } from '@bluish/core'
import { MockedAzureFunctionContext } from './MockedAzureFunctionContext'
import { MockedAzureHttpRequest, MockedAzureHttpRequestOptions } from './MockedAzureHttpRequest'

export class MockedHttpContext extends HttpContext {
  constructor(
    bindingIn: Binding,
    mockedAzureFunctionContext: MockedAzureFunctionContext,
    mockedAzureHttpRequestOptions?: MockedAzureHttpRequestOptions,
  ) {
    super(
      mockedAzureFunctionContext,
      new MockedAzureHttpRequest(bindingIn, mockedAzureHttpRequestOptions),
    )
  }

  public get response() {
    return this.azureFunctionContext.res as Record<string, unknown>
  }
}
