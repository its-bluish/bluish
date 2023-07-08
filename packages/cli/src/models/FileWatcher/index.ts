import path from 'path'

import {
  AsynchronousEventEmitter,
  type AsynchronousEventListener,
} from 'ts-asynchronous-event-emitter'
import chokidar from 'chokidar'

import { AddEvent } from './AddEvent.js'
import { ChangeEvent } from './ChangeEvent.js'
import { ReadyEvent } from './ReadyEvent.js'
import { UnlinkEvent } from './UnlinkEvent.js'

export interface FileWatcherOptions {
  rootDirectory?: string
}

export class FileWatcher extends AsynchronousEventEmitter<
  AddEvent | ReadyEvent | ChangeEvent | UnlinkEvent
> {
  private _addInitialEmissions?: Array<Promise<AddEvent>> = []
  private readonly _watcher: chokidar.FSWatcher

  constructor(
    paths: string | string[],
    { rootDirectory = path.resolve() }: FileWatcherOptions = {},
  ) {
    super()

    this._watcher = chokidar.watch(paths, {
      cwd: rootDirectory,
    })

    this._watcher.on('add', filepath => {
      const emission = this.emit(new AddEvent(filepath, rootDirectory))

      this._addInitialEmissions?.push(emission)
    })

    this._watcher.on('ready', () => {
      void Promise.all(this._addInitialEmissions ?? []).then(
        async () => await this.emit(new ReadyEvent()),
      )
      delete this._addInitialEmissions
    })

    this._watcher.on(
      'change',
      filepath => void this.emit(new ChangeEvent(filepath, rootDirectory)),
    )

    this._watcher.on(
      'unlink',
      filepath => void this.emit(new UnlinkEvent(filepath, rootDirectory)),
    )
  }

  public onAdd(
    ...listeners: Array<AsynchronousEventListener<this, AddEvent>>
  ): this {
    this.on('add', ...listeners)

    return this
  }

  public onReady(
    ...listeners: Array<AsynchronousEventListener<this, ReadyEvent>>
  ): this {
    this.on('ready', ...listeners)

    return this
  }

  public onChange(
    ...listeners: Array<AsynchronousEventListener<this, ChangeEvent>>
  ): this {
    this.on('change', ...listeners)

    return this
  }

  public onUnlink(
    ...listeners: Array<AsynchronousEventListener<this, UnlinkEvent>>
  ): this {
    this.on('unlink', ...listeners)

    return this
  }
}
