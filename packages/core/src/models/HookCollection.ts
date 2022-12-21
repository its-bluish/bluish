/* eslint-disable no-await-in-loop */
import { Collection } from '../helpers/Collection'
import { Fn } from '../typings/helpers'
import { Hook } from './Hook'

export class HookCollection extends Collection<Hook> {
  public findByEvent(event: string) {
    return this.array.filter((hook) => hook.event === event)
  }

  public callHook(hook: Hook, target: Record<string, unknown>, ...args: unknown[]): unknown {
    if (typeof hook.call === 'function') return hook.call(...args)

    if (typeof target[hook.call] !== 'function')
      throw new Error(
        `Cannot call hook as property does not exist in source or application '${target.constructor.name}.${hook.call}' '${hook.event}'`,
      )

    return (target[hook.call] as Fn)(...args)
  }

  public async callByEvent(event: string, target: Record<string, unknown>, ...args: unknown[]) {
    for (const hook of this.findByEvent(event)) {
      await this.callHook(hook, target, ...args)
    }
  }

  public async getFirstReturnByEvent(
    event: string,
    target: Record<string, unknown>,
    ...args: unknown[]
  ): Promise<unknown> {
    for (const hook of this.findByEvent(event)) {
      const result = await this.callHook(hook, target, ...args)

      if (result !== void 0) return result
    }

    return void 0
  }

  public async reduceArgumentByEvent(
    event: string,
    target: Record<string, unknown>,
    argumentTarget: unknown,
    ...args: unknown[]
  ) {
    let lastArgumentTransformation = argumentTarget

    for (const hook of this.findByEvent(event)) {
      const result = await this.callHook(hook, target, lastArgumentTransformation, ...args)

      if (result !== void 0) lastArgumentTransformation = result
    }

    return lastArgumentTransformation
  }

  public async callByEventAsync(
    event: string,
    target: Record<string, unknown>,
    ...args: unknown[]
  ) {
    return Promise.all(this.findByEvent(event).map((hook) => this.callHook(hook, target, ...args)))
  }
}
