/* eslint-disable no-await-in-loop */
import { HookCollection } from '../models/HookCollection'

const log = async (
  event: string,
  entries: [HookCollection, Record<string, unknown>][],
  ...args: unknown[]
) => {
  await Promise.allSettled(
    entries.map(async ([collection, target]) =>
      collection.callByEventAsync(`log:${event}`, target, ...args),
    ),
  )
}

export namespace HookCollectionSequencer {
  export async function callByEvent(
    event: string,
    entries: [HookCollection, Record<string, unknown>][],
    ...args: unknown[]
  ) {
    await log(event, entries, ...args)

    for (const [collection, target] of entries) {
      await collection.callByEvent(event, target, ...args)
    }
  }

  export async function getFirstReturnByEvent(
    event: string,
    entries: [HookCollection, Record<string, unknown>][],
    ...args: unknown[]
  ): Promise<unknown> {
    await log(event, entries, ...args)

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
    await log(event, entries, argumentTarget, ...args)

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
