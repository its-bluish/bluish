import { Middleware } from '../../models/Middleware.js'
import { getSourceMetadata } from '../../tools/getSourceMetadata.js'
import { Use } from '../Use.js'

describe('Use', () => {
  it('adds middleware to source metadata', () => {
    class TestMiddleware extends Middleware {}
    const testMiddleware = new TestMiddleware()

    @Use(testMiddleware)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([testMiddleware])
  })

  it('adds middleware to source trigger metadata', () => {
    class TestMiddleware extends Middleware {}
    const testMiddleware = new TestMiddleware()

    class Test {
      @Use(testMiddleware)
      public trigger(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('trigger').middlewares,
    ).toEqual([testMiddleware])
  })

  it('adds middleware to source metadata and source trigger metadata together', () => {
    class TestMiddleware extends Middleware {}
    const testMiddleware1 = new TestMiddleware()
    const testMiddleware2 = new TestMiddleware()

    @Use(testMiddleware1)
    class Test {
      @Use(testMiddleware2)
      public trigger(): void {}
    }

    expect(getSourceMetadata(Test).middlewares).toEqual([testMiddleware1])
    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('trigger').middlewares,
    ).toEqual([testMiddleware2])
  })

  it('adds many middlewares to source metadata', () => {
    class TestMiddleware extends Middleware {}
    const testMiddleware1 = new TestMiddleware()
    const testMiddleware2 = new TestMiddleware()

    @Use(testMiddleware1)
    @Use(testMiddleware2)
    class Test {}

    expect(getSourceMetadata(Test).middlewares).toEqual([
      testMiddleware1,
      testMiddleware2,
    ])
  })

  it('adds many middlewares to source trigger metadata', () => {
    class TestMiddleware extends Middleware {}
    const testMiddleware1 = new TestMiddleware()
    const testMiddleware2 = new TestMiddleware()

    class Test {
      @Use(testMiddleware1)
      @Use(testMiddleware2)
      public trigger(): void {}
    }

    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('trigger').middlewares,
    ).toEqual([testMiddleware1, testMiddleware2])
  })

  it('adds many middlewares to source metadata and source trigger metadata together', () => {
    class TestMiddleware extends Middleware {}
    const testMiddleware1 = new TestMiddleware()
    const testMiddleware2 = new TestMiddleware()
    const testMiddleware3 = new TestMiddleware()
    const testMiddleware4 = new TestMiddleware()

    @Use(testMiddleware1)
    @Use(testMiddleware2)
    class Test {
      @Use(testMiddleware3)
      @Use(testMiddleware4)
      public trigger(): void {}
    }

    expect(getSourceMetadata(Test).middlewares).toEqual([
      testMiddleware1,
      testMiddleware2,
    ])
    expect(
      getSourceMetadata(Test).getSourceTriggerMetadata('trigger').middlewares,
    ).toEqual([testMiddleware3, testMiddleware4])
  })
})
