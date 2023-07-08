import {
  AsynchronousEvent,
  AsynchronousEventEmitter,
} from 'ts-asynchronous-event-emitter'

import {
  type AfterSourceTriggerBinderDownEvent,
  type AfterSourceTriggerBinderUpEvent,
  type BeforeSourceTriggerBinderDownEvent,
  type BeforeSourceTriggerBinderUpEvent,
  Mirror,
} from './Mirror.js'
import { _import } from '../tools/_import.js'

import type TypeScriptBuilder from '../helpers/TypeScriptBuilder.js'

class BeforeMirrorDownEvent extends AsynchronousEvent<
  'before:mirror:down',
  Mirror
> {
  constructor(mirror: Mirror) {
    super('before:mirror:down', mirror)
  }
}

class AfterMirrorDownEvent extends AsynchronousEvent<
  'after:mirror:down',
  Mirror
> {
  constructor(mirror: Mirror) {
    super('after:mirror:down', mirror)
  }
}

class BeforeMirrorUpEvent extends AsynchronousEvent<
  'before:mirror:up',
  Mirror
> {
  constructor(mirror: Mirror) {
    super('before:mirror:up', mirror)
  }
}

class AfterMirrorUpEvent extends AsynchronousEvent<'after:mirror:up', Mirror> {
  constructor(mirror: Mirror) {
    super('after:mirror:up', mirror)
  }
}

export class Collection extends AsynchronousEventEmitter<
  | BeforeMirrorDownEvent
  | AfterMirrorDownEvent
  | BeforeMirrorUpEvent
  | AfterMirrorUpEvent
  | BeforeSourceTriggerBinderUpEvent
  | BeforeSourceTriggerBinderDownEvent
  | AfterSourceTriggerBinderUpEvent
  | AfterSourceTriggerBinderDownEvent
> {
  private readonly _mirrors = new Map<string, Mirror>()

  private readonly _beforeSourceTriggerBinderUp = async (
    event: BeforeSourceTriggerBinderUpEvent,
  ): Promise<void> => {
    await this.emit(event)
  }

  private readonly _afterSourceTriggerBinderUp = async (
    event: AfterSourceTriggerBinderUpEvent,
  ): Promise<void> => {
    await this.emit(event)
  }

  private readonly _beforeSourceTriggerBinderDown = async (
    event: BeforeSourceTriggerBinderDownEvent,
  ): Promise<void> => {
    await this.emit(event)
  }

  private readonly _afterSourceTriggerBinderDown = async (
    event: AfterSourceTriggerBinderDownEvent,
  ): Promise<void> => {
    await this.emit(event)
  }

  constructor(protected readonly builder: TypeScriptBuilder) {
    super()
  }

  public async removeBySourcePath(sourcePath: string): Promise<void> {
    await Promise.all(
      Array.from(this._mirrors).map(async ([key, mirror]) => {
        if (!key.startsWith(`${sourcePath}#`)) return

        await this.emit(new BeforeMirrorDownEvent(mirror))

        await mirror.down()

        await this.emit(new AfterMirrorDownEvent(mirror))

        mirror.off(
          'after:source-trigger-binder:down',
          this._afterSourceTriggerBinderDown,
        )
        mirror.off(
          'after:source-trigger-binder:up',
          this._afterSourceTriggerBinderUp,
        )
        mirror.off(
          'before:source-trigger-binder:down',
          this._beforeSourceTriggerBinderDown,
        )
        mirror.off(
          'before:source-trigger-binder:up',
          this._beforeSourceTriggerBinderUp,
        )

        this._mirrors.delete(mirror.id)
      }),
    )
  }

  public async addBySourcePath(sourcePath: string): Promise<void> {
    await this.addByModule(
      await _import(await this.builder.find(sourcePath)),
      sourcePath,
    )
  }

  protected async addByModule(module: any, sourcePath: string): Promise<void> {
    await Promise.all(
      Object.entries<Function>(module).map(
        async ([exportIdentifier, constructor]) => {
          if (typeof constructor !== 'function') return

          await this.addByFunction(constructor, sourcePath, exportIdentifier)
        },
      ),
    )
  }

  protected async addByFunction(
    constructor: Function,
    sourcePath: string,
    exportIdentifier: string,
  ): Promise<void> {
    const mirror = new Mirror(this.builder.configuration, {
      sourcePath,
      compileFullPath: await this.builder.find(sourcePath),
      exportIdentifier,
      constructor,
    })

    mirror.on({
      'after:source-trigger-binder:down': this._afterSourceTriggerBinderDown,
      'after:source-trigger-binder:up': this._afterSourceTriggerBinderUp,
      'before:source-trigger-binder:down': this._beforeSourceTriggerBinderDown,
      'before:source-trigger-binder:up': this._beforeSourceTriggerBinderUp,
    })

    this._mirrors.set(mirror.id, mirror)

    await this.emit(new BeforeMirrorUpEvent(mirror))
    await mirror.up()
    await this.emit(new AfterMirrorUpEvent(mirror))
  }
}
