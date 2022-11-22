import { HttpTrigger } from "../../decorators/triggers/HttpTrigger"
import { Metadata } from "../../models/metadata"
import { wait } from "../wait"

describe('wait', () => {
  it('works', async () => {
    class TestTarget {
      public httpGet() {}
    }

    const promise = wait.any(TestTarget)

    HttpTrigger('/', 'get')(TestTarget.prototype, 'httpGet')

    const metadata = await promise as Metadata

    expect(metadata).toBeInstanceOf(Metadata)

    expect(metadata.triggers.hasTriggerWithProperty('httpGet')).toBeTruthy()
  })
})
