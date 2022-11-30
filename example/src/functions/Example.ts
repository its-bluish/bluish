import { Bind, Timer, TimerContext, EventGrid, EventGridContext } from "@bluish/core"
import http from 'http'

export class Example {
  @Timer('0 */1 * * * *')
  public async timer(@Bind() context: TimerContext) {
    console.log("@Timer('0 */1 * * * *')", new Date())
  }

  @EventGrid()
  public eventGrid(@Bind() context: EventGridContext) {
    console.log("@EventGrid()", new Date(), context.payload)
  }

  @Timer('*/5 * * * * *')
  public sendEventGrid() {
    const request = http.request('http://127.0.0.1:8080/runtime/webhooks/EventGrid?functionName=Example_eventGrid', {
      method: 'POST',
    })

    request.setHeader('Content-Type', 'application/json')
    request.setHeader('aeg-event-type', 'Notification')
    request.write(JSON.stringify({}))

    request.end()
  }
}