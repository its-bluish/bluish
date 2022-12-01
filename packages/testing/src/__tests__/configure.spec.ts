/* eslint-disable @typescript-eslint/no-extraneous-class */
import { App, Http, OnInitialize } from '@bluish/core'
import { configure } from '../configure'
import { run } from '../run'

describe('configure', () => {
  it('.', async () => {
    const onInitialize = jest.fn()

    @App()
    @OnInitialize(onInitialize)
    class Application {}

    configure({ Application })

    class Testing {
      @Http.Get('/testing')
      public testing() {}
    }

    await run.http.get(Testing, 'testing')

    expect(onInitialize).toHaveBeenCalled()
  })
})
