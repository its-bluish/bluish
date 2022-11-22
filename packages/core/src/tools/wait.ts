import { ApplicationMetadata } from "../models/metadata/Application"
import { Metadata } from "../models/metadata"
import { PromiseToo } from "../typings/PromiseToo"

type Waiter = (target: Function) => PromiseToo<boolean>

const waiters: ((...args: Parameters<Waiter>) => void)[] = []

const _offs: Function[] = []

export function wait(waiter: Waiter) {
  const wrapper = async (...args: Parameters<Waiter>) => {
    const remove = await waiter(...args)

    if (remove) {
      waiters.splice(waiters.indexOf(waiter), 1)
      _offs.forEach(off => off())
    }
  }

  waiters.push(wrapper)
}

wait.any = async (target: Function | Object, property?: string): Promise<Metadata | ApplicationMetadata> => {
  const constructor = typeof target === 'function' ? target : target.constructor

  const maybeMetadata = (() => {
    const metadata = Metadata.load(target)

    if (metadata) return metadata

    if (ApplicationMetadata.isSame(target)) return ApplicationMetadata.get()!
  })()

  if (maybeMetadata) {

    if (property) {

      if (maybeMetadata instanceof Metadata && maybeMetadata.triggers.hasTriggerWithProperty(property))

        return maybeMetadata

    }

    else return maybeMetadata
  }

  if (
    maybeMetadata &&
    property &&
    maybeMetadata instanceof Metadata &&
    maybeMetadata.triggers.hasTriggerWithProperty(property)
  ) return maybeMetadata

  return new Promise(resolve => wait(async target => {
    if (target !== constructor) return false

    const metadata = await wait.any(constructor, property)
    
    if (property) {

      if (metadata instanceof ApplicationMetadata) return false

      if (!metadata.triggers.hasTriggerWithProperty(property)) return false

    }

    resolve(metadata)

    return true
  }))
}

wait.cast = (metadata: Metadata | ApplicationMetadata) => {
  waiters.forEach(waiter => waiter(metadata.target))
}

wait.cleaning = () => new Promise<void>((resolve) => {
  if (!waiters.length) return setImmediate(resolve)

  _offs.push(() => {
    if (!waiters.length) setImmediate(resolve)
  })
})
