import { type ConstructorOf } from '../typings/helpers.js'
import { type Middleware } from './Middleware.js'
import { SourceTriggerMetadata } from './SourceTriggerMetadata.js'

export class SourceMetadata {
  private readonly _sourceTriggerMetadataMap = new Map<
    string,
    SourceTriggerMetadata
  >()

  public middlewares: Middleware[] = []

  public binders: {
    [K in keyof Bluish.SourceMetadataBinders]?: Bluish.SourceMetadataBinders[K]
  } = {}

  public static binders: {
    [K in keyof Bluish.SourceMetadataBinders]?: (
      sourceMetadata: SourceMetadata,
    ) => Bluish.SourceMetadataBinders[K]
  } = {}

  constructor(public target: ConstructorOf<unknown>) {}

  public useBinder<K extends keyof Bluish.SourceMetadataBinders>(
    binder: K,
  ): Bluish.SourceMetadataBinders[K] {
    // @ts-expect-error: TODO
    return (this.binders[binder] ??= SourceMetadata.binders[binder](this))
  }

  public get sourceTriggerMetadatas(): SourceTriggerMetadata[] {
    return Array.from(this._sourceTriggerMetadataMap.values())
  }

  public getSourceTriggerMetadata(propertyKey: string): SourceTriggerMetadata {
    if (!this._sourceTriggerMetadataMap.has(propertyKey))
      this._sourceTriggerMetadataMap.set(
        propertyKey,
        new SourceTriggerMetadata(this, propertyKey),
      )

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._sourceTriggerMetadataMap.get(propertyKey)!
  }

  [key: string]: unknown
}

declare global {
  namespace Bluish {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SourceMetadataBinders {}
  }
}
