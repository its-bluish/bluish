import { getSourceMetadata } from '../../tools/getSourceMetadata.js'
import { OnInitialize } from '../OnInitialize.js'

describe('OnInitialize', () => {
  it('adds on after middleware to source metadata', () => {
    const fn = jest.fn()

    @OnInitialize(fn)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([
      expect.objectContaining({ onInitialize: fn }),
    ])
  })

  it('adds on after middleware to source trigger metadata', () => {
    const fn = jest.fn()

    class Test {
      @OnInitialize(fn)
      public method(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('method').middlewares,
    ).toEqual([expect.objectContaining({ onInitialize: fn })])
  })
})
