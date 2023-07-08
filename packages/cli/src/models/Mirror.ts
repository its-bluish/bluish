import {
  type Driver,
  getSourceMetadata,
  type SourceTriggerBinder,
} from '@bluish/core'
import { AsynchronousCascadeArray } from 'asynchronous-cascade-array'
import {
  AsynchronousEvent,
  AsynchronousEventEmitter,
} from 'ts-asynchronous-event-emitter'

import { type Configuration } from './Configuration.js'

export interface MirrorOptions {
  sourcePath: string
  compileFullPath: string
  exportIdentifier: string
  constructor: Function
}

export class BeforeSourceTriggerBinderDownEvent extends AsynchronousEvent<'before:source-trigger-binder:down'> {
  constructor(
    public sourceTriggerBinder: SourceTriggerBinder,
    public driver: Driver<SourceTriggerBinder>,
  ) {
    super('before:source-trigger-binder:down')
  }
}

export class AfterSourceTriggerBinderDownEvent extends AsynchronousEvent<'after:source-trigger-binder:down'> {
  constructor(
    public sourceTriggerBinder: SourceTriggerBinder,
    public driver: Driver<SourceTriggerBinder>,
  ) {
    super('after:source-trigger-binder:down')
  }
}

export class BeforeSourceTriggerBinderUpEvent extends AsynchronousEvent<'before:source-trigger-binder:up'> {
  constructor(
    public sourceTriggerBinder: SourceTriggerBinder,
    public driver: Driver<SourceTriggerBinder>,
  ) {
    super('before:source-trigger-binder:up')
  }
}

export class AfterSourceTriggerBinderUpEvent extends AsynchronousEvent<'after:source-trigger-binder:up'> {
  constructor(
    public sourceTriggerBinder: SourceTriggerBinder,
    public driver: Driver<SourceTriggerBinder>,
  ) {
    super('after:source-trigger-binder:up')
  }
}

export class Mirror extends AsynchronousEventEmitter<
  | BeforeSourceTriggerBinderUpEvent
  | BeforeSourceTriggerBinderDownEvent
  | AfterSourceTriggerBinderUpEvent
  | AfterSourceTriggerBinderDownEvent
> {
  public get id(): string {
    return `${this.options.sourcePath}#${this.options.exportIdentifier}`
  }

  constructor(
    protected readonly configuration: Configuration,
    protected readonly options: MirrorOptions,
  ) {
    super()
  }

  protected async findDriverBySourceTriggerBinder(
    sourceTriggerBinder: SourceTriggerBinder,
  ): Promise<Driver<SourceTriggerBinder> | null> {
    return await new AsynchronousCascadeArray(this.configuration.drivers).find(
      async driver => {
        return await AsynchronousCascadeArray.from<any>(driver.to()).some(
          item => sourceTriggerBinder instanceof item,
        )
      },
    )
  }

  protected async forEachSourceTriggerBinder(
    fn: (sourceTriggerBinder: SourceTriggerBinder) => Promise<void>,
  ): Promise<void> {
    await AsynchronousCascadeArray.from(
      getSourceMetadata(this.options.constructor).sourceTriggerMetadatas,
    ).forEach(
      async sourceTriggerMetadata =>
        await AsynchronousCascadeArray.from(
          Object.values(sourceTriggerMetadata.binders),
        ).forEach(async sourceTriggerBinder => {
          if (!sourceTriggerBinder) return

          await fn(sourceTriggerBinder)
        }),
    )
  }

  public async up(): Promise<void> {
    await this.forEachSourceTriggerBinder(async sourceTriggerBinder => {
      const driver = await this.findDriverBySourceTriggerBinder(
        sourceTriggerBinder,
      )

      if (!driver) {
        console.warn(
          `Not found driver for binder ${sourceTriggerBinder.constructor.name}`,
        )
        return
      }

      await this.emit(
        new BeforeSourceTriggerBinderUpEvent(sourceTriggerBinder, driver),
      )

      await driver.up(sourceTriggerBinder, {
        key: this.options.exportIdentifier,
        path: this.options.compileFullPath,
      })

      await this.emit(
        new AfterSourceTriggerBinderUpEvent(sourceTriggerBinder, driver),
      )
    })
  }

  public async down(): Promise<void> {
    await this.forEachSourceTriggerBinder(async sourceTriggerBinder => {
      const driver = await this.findDriverBySourceTriggerBinder(
        sourceTriggerBinder,
      )

      if (!driver) {
        console.warn(
          `Not found driver for binder ${sourceTriggerBinder.constructor.name}`,
        )
        return
      }

      await this.emit(
        new BeforeSourceTriggerBinderDownEvent(sourceTriggerBinder, driver),
      )

      await driver.down(sourceTriggerBinder, {
        key: this.options.exportIdentifier,
        path: this.options.compileFullPath,
      })

      await this.emit(
        new AfterSourceTriggerBinderDownEvent(sourceTriggerBinder, driver),
      )
    })
  }
}
