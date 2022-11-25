import { ApplicationMetadata } from '../models/metadata/Application'
import { Metadata } from '../models/metadata'
import { PromiseToo } from '../typings/PromiseToo'

type Waiter = (target: Function) => PromiseToo<boolean>

const waiters: ((...args: Parameters<Waiter>) => PromiseToo<void>)[] = []

const offs: (() => unknown)[] = []

export function wait(waiter: Waiter) {
  const wrapper = async (...args: Parameters<Waiter>) => {
    const remove = await waiter(...args)

    if (remove) {
      waiters.splice(waiters.indexOf(wrapper), 1)
      offs.forEach((off) => off())
    }
  }

  waiters.push(wrapper)
}

const get = (target: Function | Object, property?: string) => {
  const maybeMetadata = (() => {
    const metadata = Metadata.load(target)

    if (metadata) return metadata

    if (ApplicationMetadata.isSame(target)) return ApplicationMetadata.get() as ApplicationMetadata

    return null
  })()

  if (maybeMetadata) {
    if (property) {
      if (
        maybeMetadata instanceof Metadata &&
        maybeMetadata.triggers.hasTriggerWithProperty(property)
      )
        return maybeMetadata
    } else return maybeMetadata
  }

  if (
    maybeMetadata &&
    property &&
    maybeMetadata instanceof Metadata &&
    maybeMetadata.triggers.hasTriggerWithProperty(property)
  )
    return maybeMetadata

  return null
}

wait.any = async (
  target: Function | Object,
  property?: string,
): Promise<Metadata | ApplicationMetadata> => {
  const constructor = typeof target === 'function' ? target : target.constructor

  const maybeMetadata = get(target, property)

  if (maybeMetadata) return maybeMetadata

  return new Promise((resolve) => {
    wait((maybeThatTarget) => {
      if (maybeThatTarget !== constructor) return false

      const metadata = get(target, property)

      if (!metadata) return false

      resolve(metadata)

      return true
    })
  })
}

wait.cast = (metadata: Metadata | ApplicationMetadata) => {
  waiters.forEach((waiter) => void waiter(metadata.target))
}

wait.cleaning = async () =>
  new Promise<void>((resolve) => {
    if (!waiters.length) return setImmediate(resolve)

    return offs.push(() => {
      if (!waiters.length) setImmediate(resolve)
    })
  })
