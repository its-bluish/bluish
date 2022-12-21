/* eslint-disable no-await-in-loop */
import { HookCollection } from '../models/HookCollection'

export namespace HookCollectionSequencer {
  export async function callByEvent(
    event: string,
    entries: [HookCollection, Record<string, unknown>][],
    ...args: unknown[]
  ) {
    for (const [collection, target] of entries) {
      await collection.callByEvent(event, target, ...args)
    }
  }

  export async function getFirstReturnByEvent(
    event: string,
    entries: [HookCollection, Record<string, unknown>][],
    ...args: unknown[]
  ): Promise<unknown> {
    for (const [collection, target] of entries) {
      const result = await collection.getFirstReturnByEvent(event, target, ...args)

      if (result !== void 0) return result
    }

    return void 0
  }

  export async function reduceArgumentByEvent(
    event: string,
    entries: [HookCollection, Record<string, unknown>][],
    argumentTarget: unknown,
    ...args: unknown[]
  ) {
    let lastArgumentTransformation = argumentTarget

    for (const [collection, target] of entries) {
      const result = await collection.reduceArgumentByEvent(
        event,
        target,
        lastArgumentTransformation,
        ...args,
      )

      if (result !== void 0) lastArgumentTransformation = result
    }

    return lastArgumentTransformation
  }
}
