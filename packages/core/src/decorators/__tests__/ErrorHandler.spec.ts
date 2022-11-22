import { Runner } from "../../models/Runner"
import { MockContext } from "../../test-utils/MockContext"
import { run } from "../../test-utils/run"
import { ErrorHandler } from "../ErrorHandler"
import { Trigger } from "../triggers/Trigger"

describe('ErrorHandler', () => {
  it('.', async () => {
    class TriggerTest {
      @Trigger({ Context: MockContext })
      @ErrorHandler((error) => {
        if (typeof error !== 'object') return void 0
        if (!(error instanceof Error)) return void 0
        return {
          status: 500,
          body: {
            message: error.message
          }
        }
      })
      public run() {
        throw new Error('testing');
      }
    }

    await expect(run(new Runner(TriggerTest, 'run'))).resolves.toEqual({ status: 500, body: { message: 'testing' } })
  })
})