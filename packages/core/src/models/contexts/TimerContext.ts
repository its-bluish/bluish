import { AzureFunctionContext, Context } from './Context'

export interface AzureFunctionTimerContext {
  Schedule: {
    AdjustForDST: boolean
  }
  ScheduleStatus: {
    Last: string
    LastUpdated: string
    Next: string
  }
  IsPastDue: boolean
}

export class TimerContext extends Context {
  constructor(
    context: AzureFunctionContext,
    protected azureFuctionTimerContext: AzureFunctionTimerContext,
  ) {
    super(context)
  }

  public get isPastDue() {
    return this.azureFuctionTimerContext.IsPastDue
  }

  public get last() {
    return new Date(this.azureFuctionTimerContext.ScheduleStatus.Last)
  }

  public get updated() {
    return new Date(this.azureFuctionTimerContext.ScheduleStatus.LastUpdated)
  }

  public get next() {
    return new Date(this.azureFuctionTimerContext.ScheduleStatus.Next)
  }

  public success() {
    return void 0
  }

  public unhandledError(error: unknown) {
    throw error
  }

  public handledError() {
    return void 0
  }
}
