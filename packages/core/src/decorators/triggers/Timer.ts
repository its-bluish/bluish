import { Binding } from '../../models/Binding'
import { TimerContext } from '../../models/contexts/TimerContext'
import { Trigger } from './Trigger'

export interface TimerOptions<C extends TimerContext> {
  Context?: new (...args: any[]) => C
  runOnStartup?: boolean
  useMonitor?: boolean
}

export function Timer<C extends TimerContext>(
  schedule: string,
  {
    Context = TimerContext as new (...args: any[]) => C,
    runOnStartup,
    useMonitor,
  }: TimerOptions<C> = {},
) {
  const bindings = [
    new Binding('timerTrigger', 'timer', 'in', { schedule, runOnStartup, useMonitor }),
  ]

  return Trigger({ Context, bindings })
}

export namespace Timer {}
