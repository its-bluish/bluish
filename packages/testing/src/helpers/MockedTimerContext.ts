import { Binding, TimerContext } from '@bluish/core'
import { MockedAzureFunctionContext } from './MockedAzureFunctionContext'

export class MockedTimerContext extends TimerContext {
  constructor(bindingIn: Binding, mockedAzureFunctionContext: MockedAzureFunctionContext) {
    if (typeof bindingIn.schedule !== 'string') throw new Error('TODO')

    super(mockedAzureFunctionContext, {
      IsPastDue: false,
      Schedule: {
        AdjustForDST: false,
      },
      ScheduleStatus: {
        Last: new Date(0).toISOString(),
        Next: new Date().toISOString(),
        LastUpdated: new Date().toISOString(),
      },
    })
  }
}
