import chokidar from 'chokidar'
import Emitter from '@cookiex/emitter'

const CHANGE_TIMEOUT = 500

export interface ChokidarWatcherEvents {
  change(path: string): void
  add(path: string): void
  unlink(path: string): void
}

export class ChokidarWatcher extends Emitter<ChokidarWatcherEvents> {
  private _watcher: chokidar.FSWatcher
  private _changeTimeout = new Map<string, NodeJS.Timeout>()

  constructor(paths: string | readonly string[], options?: chokidar.WatchOptions) {
    super()

    this._watcher = chokidar.watch(paths, options)

    this._watcher.on('change', path => this._change(path))
    this._watcher.on('add', path => this.emit('add', path))
    this._watcher.on('unlink', path => this.emit('unlink', path))
  }

  private _change(path: string) {
    if (this._changeTimeout.has(path)) clearTimeout(this._changeTimeout.get(path))
      
    return this._changeTimeout.set(path, setTimeout(() => {
      this._changeTimeout.delete(path)

      this.emit('change', path)
    }, CHANGE_TIMEOUT))
  }

  public close() {
    this._watcher.close()
  }
}
