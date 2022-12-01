import { Timer, TimerContext } from '@bluish/core'
import { run } from '..'

describe('run.timer', () => {
  it('returned context is an instance of TimerContext', async () => {
    class Testing {
      @Timer('* * * * * *')
      public testing() {}
    }
    await expect(run.timer(Testing, 'testing')).resolves.toBeInstanceOf(TimerContext)
  })
})
