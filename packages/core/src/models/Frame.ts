import { type PromiseLikeToo } from '../index.js'
import { type SourceTriggerBinder } from './SourceTriggerBinder.js'

export abstract class Frame {
  public sourceDirectory!: string

  public outputDirectory!: string

  public onSourceTriggerBinderUp(
    sourceTriggerBinder: SourceTriggerBinder,
  ): PromiseLikeToo<void> {}

  public onSourceTriggerBinderDown(
    sourceTriggerBinder: SourceTriggerBinder,
  ): PromiseLikeToo<void> {}

  public onApplicationUp(application: object): PromiseLikeToo<void> {}

  public onApplicationDown(application: object): PromiseLikeToo<void> {}

  public up?(): Promise<void>

  public fresh?(): Promise<void>

  public down?(): Promise<void>
}
