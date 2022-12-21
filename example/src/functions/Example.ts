import { Bind, Timer, TimerContext, EventGrid, EventGridContext, SignalR, ServiceBus } from "@bluish/core"
import http from 'http'
import crypto from 'crypto'
export class Example {
  @Timer('0 */1 * * * *')
  public async timer(@Bind() context: TimerContext) {
    console.log("@Timer('0 */1 * * * *')", new Date())
  }

  @EventGrid()
  public eventGrid(@Bind() context: EventGridContext) {
    console.log("@EventGrid()", new Date(), context.payload)
  }

  @Timer('0 * * * * *')
  public sendEventGrid() {
    const request = http.request('http://127.0.0.1:8080/runtime/webhooks/EventGrid?functionName=Example_eventGrid', {
      method: 'POST',
    })

    request.setHeader('Content-Type', 'application/json')
    request.setHeader('aeg-event-type', 'Notification')
    request.write(JSON.stringify({}))

    request.end()
  }

  @Timer('0 * * * * *')
  public signalR(@SignalR() send: SignalR) {
    console.log("@Timer('0 * * * * *') @SignalR()")
    send('message', new Date().toISOString())
  }

  @ServiceBus('testing')
  public async serviceBus(@ServiceBus.Item() queueItem: unknown) {
    console.log({ queueItem })

    // const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) ) + min

    // await new Promise((resolve) => setTimeout(resolve, random(10000, 100000)))
  }

  @Timer('0 * * * * *')
  public async serviceBusTimerQueue(@ServiceBus('testing') enqueue: ServiceBus<Record<string, unknown>>) {
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) ) + min

    enqueue(
      ...Array(random(100, 500)).fill(null).map(() => ({
        ticketId: crypto.randomBytes(16).toString('hex'),
        automationFlowBlockId: crypto.randomBytes(16).toString('hex'),
      }))
    )
  }
}
