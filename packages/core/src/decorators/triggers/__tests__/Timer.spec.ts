import { run } from '@bluish/testing'
import { Timer } from '../Timer'

it('Timer', async () => {
  const fn = jest.fn()
  class Testing {
    @Timer('* * * * * *')
    public testing = fn
  }

  await run.timer(Testing, 'testing')

  expect(fn).toHaveBeenCalled()
})
