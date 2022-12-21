const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/* eslint-disable no-param-reassign */
export function deepAssign(target: unknown, source: unknown): unknown {
  if (!isObject(target)) throw new Error('TODO')
  if (!isObject(source)) throw new Error('TODO')

  Object.entries(source).forEach(([key, value]) => {
    if (key === 'prototype') return void 0
    if (key === 'constructor') return void 0

    if (isObject(value) && isObject(target[key])) {
      return deepAssign(target[key], target[key])
    }

    return (target[key] = value)
  })

  return target
}
