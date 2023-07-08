import { type ConstructorOf } from '../typings/helpers.js'

const instances = new Map<ConstructorOf<any>, any>()

export function singletonify<TTarget>(
  constructor: ConstructorOf<TTarget, [], false>,
): TTarget {
  if (instances.has(constructor)) return instances.get(constructor)

  const instance = new constructor()

  instances.set(constructor, instance)

  return instance
}
