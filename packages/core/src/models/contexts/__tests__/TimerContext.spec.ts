/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { AzureFunctionContext } from '../Context'
import { AzureFunctionTimerContext, TimerContext } from '../TimerContext'

describe('TimerContext', () => {
  it('.isPastDue', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      {
        IsPastDue: true,
        ScheduleStatus: {},
      } as AzureFunctionTimerContext,
    )

    expect(timerContext.isPastDue).toBe(true)
  })

  it('.last', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      {
        ScheduleStatus: {
          Last: '2022-12-22T00:21:57.780Z',
        },
      } as AzureFunctionTimerContext,
    )

    expect(timerContext.last).toEqual(new Date('2022-12-22T00:21:57.780Z'))
  })

  it('.updated', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      {
        ScheduleStatus: {
          LastUpdated: '2022-12-22T00:21:57.780Z',
        },
      } as AzureFunctionTimerContext,
    )

    expect(timerContext.updated).toEqual(new Date('2022-12-22T00:21:57.780Z'))
  })

  it('.next', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      {
        ScheduleStatus: {
          Next: '2022-12-22T00:21:57.780Z',
        },
      } as AzureFunctionTimerContext,
    )

    expect(timerContext.next).toEqual(new Date('2022-12-22T00:21:57.780Z'))
  })

  it('.success', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      { ScheduleStatus: {} } as AzureFunctionTimerContext,
    )

    expect(timerContext.success()).toBeUndefined()
  })
  it('.unhandledError', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      { ScheduleStatus: {} } as AzureFunctionTimerContext,
    )

    expect(() => {
      timerContext.unhandledError(new Error('testing'))
    }).toThrowError('testing')
  })
  it('.handledError', () => {
    const timerContext = new TimerContext(
      {} as AzureFunctionContext,
      { ScheduleStatus: {} } as AzureFunctionTimerContext,
    )

    expect(timerContext.handledError()).toBeUndefined()
  })
})
