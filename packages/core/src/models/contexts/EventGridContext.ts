import { AzureFunctionContext, Context } from './Context'

interface FullEvent {
  topic: string
  subject: string
  eventType: string
  eventTime: string
  id: string
  data: Record<string, unknown>
  dataVersion: string
  metadataVersion: string
  [key: string]: unknown
}

export type Event = Partial<FullEvent>

export class EventGridContext extends Context {
  private readonly successOutputEvents: Event[] = []
  private readonly errorOutputEvents: Event[] = []
  private readonly outputEvents: Event[] = []

  private static normalizeEventToEvents(maybeEvents?: Event | Event[] | null) {
    if (Array.isArray(maybeEvents)) return maybeEvents
    if (maybeEvents) return [maybeEvents]
    return []
  }

  constructor(context: AzureFunctionContext, public payload: Record<string, unknown>) {
    super(context)
  }

  private _send(events: Event[]) {
    this.azureFunctionContext.bindings.outputEvent ??= []

    if (Array.isArray(this.azureFunctionContext.bindings.outputEvent))
      (this.azureFunctionContext.bindings.outputEvent as Event[]).push(...events)
  }

  public send(event: Event, _if?: 'success' | 'error') {
    if (_if === 'success') this.successOutputEvents.push(event)
    else if (_if === 'error') this.errorOutputEvents.push(event)
    else this.outputEvents.push(event)

    return this
  }

  public sendOnSuccess(event: Event) {
    this.send(event, 'success')
  }

  public sendOnError(event: Event) {
    this.send(event, 'error')
  }

  public success(maybeEventOrEvents?: Event | Event[]) {
    this._send([
      ...this.outputEvents,
      ...this.successOutputEvents,
      ...EventGridContext.normalizeEventToEvents(maybeEventOrEvents),
    ])
  }

  public unhandledError(error: unknown) {
    throw error
  }

  public handledError(maybeEventOrEvents: Event | Event[] | null) {
    this._send([
      ...this.outputEvents,
      ...this.errorOutputEvents,
      ...EventGridContext.normalizeEventToEvents(maybeEventOrEvents),
    ])
  }
}
