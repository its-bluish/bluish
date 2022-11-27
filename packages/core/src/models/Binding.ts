import { TriggerConfiguration } from './TriggerConfiguration'

export class Binding {
  public trigger!: TriggerConfiguration

  constructor(
    public type: string,
    public name: string,
    public direction: 'in' | 'out',
    others: Record<string, unknown> = {},
  ) {
    Object.assign(this, others)
  }

  public toAzureFunctionConfiguration() {
    return {
      ...this,
      trigger: void 0,
    }
  }

  [key: string]: unknown
}
