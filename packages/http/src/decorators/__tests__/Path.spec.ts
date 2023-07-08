import { getSourceMetadata } from '@bluish/core'

import { Path } from '../Path.js'

import '../../models/HttpSourceBinder.js'
import '../../models/HttpSourceTriggerBinder.js'

describe('Path', () => {
  it('set source metadata route path', () => {
    @Path('/tests')
    class Tests {
      public test(): void {}
    }

    expect(getSourceMetadata(Tests).useBinder('http').path).toBe('/tests')
  })

  it('set source trigger metadata route path', () => {
    class Tests {
      @Path('/tests')
      public test(): void {}
    }

    expect(
      getSourceMetadata(Tests)
        .getSourceTriggerMetadata('test')
        .useBinder('http').path,
    ).toBe('/tests')
  })

  it('create route path', () => {
    @Path('/tests')
    class Tests {
      @Path('/test')
      public test(): void {}
    }

    expect(
      getSourceMetadata(Tests)
        .getSourceTriggerMetadata('test')
        .useBinder('http').route,
    ).toBe('/tests/test')
  })
})
