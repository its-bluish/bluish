import { Runner } from "../../models/Runner"
import { Trigger } from "../triggers/Trigger"
import { run } from '../../test-utils/run'
import { OnError } from "../OnError"
import { Context } from "../../models/contexts/Context"
import { MockContext } from "../../test-utils/MockContext"

describe('OnError', () => {
  it('called as trigger decorator', async () => {
    const onError = jest.fn()
    class OnErrorTest {
      @Trigger({ Context: MockContext })
      @OnError(onError)
      public run() {
        throw new Error('testing');
      }
    }

    await expect(run(new Runner(OnErrorTest, 'run'))).rejects.toThrowError()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Context))
  })

  it('called as class decorator', async () => {
    const onError = jest.fn()

    @OnError(onError)
    class OnErrorTest {
      @Trigger({ Context: MockContext })
      public run() {
        throw new Error('testing');
      }
    }

    await expect(run(new Runner(OnErrorTest, 'run'))).rejects.toThrowError()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Context))
  })

  it('called as a decorator of a property other than the trigger', async () => {
    const onError = jest.fn()

    class OnErrorTest {
      @Trigger({ Context: MockContext })
      public run() {
        throw new Error('testing');
      }

      @OnError()
      public onError(error: unknown, context: Context) {
        onError(error, context)
      }
    }
  
    await expect(run(new Runner(OnErrorTest, 'run'))).rejects.toThrowError()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Context))
  })
})

declare global {
  namespace jest {
    interface Expect {
      any<T extends Constructor | (abstract new (...args: any[]) => any)>(classType: T): T extends Func ? ReturnType<T> : InstanceType<T>;
    }
  }
}
