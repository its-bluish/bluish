import { Trigger } from "./Trigger";

export class Binding {
  public trigger!: Trigger

  constructor(
    public type: string,
    public name: string,
    public direction: 'in' | 'out',
    others: Record<string, unknown> = {}
  ) {
    Object.assign(this, others)
  }

  public toAzureFunctionConfiguration() {
    return {
      ...this,
      trigger: undefined
    }
  }
}

export interface Binding {
  [key: string]: unknown
}
