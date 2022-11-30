import { Binding } from '../../models/Binding'
import { EventGridContext } from '../../models/contexts/EventGridContext'
import { Trigger } from './Trigger'

export interface EventGridOutputEventOptions {
  endpoint: string
  key: string
}

export function EventGrid(outputOptions?: EventGridOutputEventOptions) {
  return Trigger({
    Context: EventGridContext,
    bindings: [
      new Binding('eventGridTrigger', 'eventGridEvent', 'in'),
      outputOptions
        ? new Binding('eventGrid', 'outputEvent', 'out', {
            topicEndpointUri: outputOptions.endpoint,
            topicKeySetting: outputOptions.key,
          })
        : null,
    ],
  })
}
