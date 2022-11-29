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
  IsPastDue: false
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

  public success = () => void 0
  public unhandledError = () => void 0
  public handledError = () => void 0
}
