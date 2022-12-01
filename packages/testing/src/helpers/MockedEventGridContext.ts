import { EventGridContext, Event } from '@bluish/core'
import { MockedAzureFunctionContext } from './MockedAzureFunctionContext'

export interface MockedEventGridContextPayload extends Required<Event> {}

export class MockedEventGridContext extends EventGridContext {
  constructor(
    mockedAzureFunctionContext: MockedAzureFunctionContext,
    payload: MockedEventGridContextPayload = {
      topic: 'testing',
      subject: 'testing',
      data: {},
      dataVersion: 'v0.0.0',
      eventTime: new Date().toISOString(),
      eventType: 'testing',
      id: 'testing',
      metadataVersion: 'v0.0.0',
    },
  ) {
    super(mockedAzureFunctionContext, payload)
  }
}
