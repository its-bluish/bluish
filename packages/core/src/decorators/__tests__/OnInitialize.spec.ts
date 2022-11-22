import { Runner } from "../../models/Runner"
import { Trigger } from "../triggers/Trigger"
import { run } from '../../test-utils/run'
import { OnInitialize } from "../OnInitialize"
import { Context } from "../../models/contexts/Context"
import { MockContext } from "../../test-utils/MockContext"

describe('OnInitialize', () => {
  it('called as trigger decorator', async () => {
    const onInitialize = jest.fn()
    class OnInitializeTest {
      @Trigger({ Context: MockContext })
      @OnInitialize(onInitialize)
      public run() {}
    }

    await run(new Runner(OnInitializeTest, 'run'))

    expect(onInitialize).toHaveBeenCalledWith(expect.any(Context))
  })

  it('called as class decorator', async () => {
    const onInitialize = jest.fn()

    @OnInitialize(onInitialize)
    class OnInitializeTest {
      @Trigger({ Context: MockContext })
      public run() {}
    }

    await run(new Runner(OnInitializeTest, 'run'))

    expect(onInitialize).toHaveBeenCalledWith(expect.any(Context))
  })

  it('called as a decorator of a property other than the trigger', async () => {
    const onInitialize = jest.fn()

    class OnInitializeTest {
      @Trigger({ Context: MockContext })
      public run() {}

      @OnInitialize()
      public init(context: Context) {
        onInitialize(context)
      }
    }
  
    await run(new Runner(OnInitializeTest, 'run'))

    expect(onInitialize).toHaveBeenCalledWith(expect.any(Context))
  })
})

declare global {
  namespace jest {
    interface Expect {
      any<T extends Constructor | (abstract new (...args: any[]) => any)>(classType: T): T extends Func ? ReturnType<T> : InstanceType<T>;
    }
  }
}
