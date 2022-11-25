/* eslint-disable no-underscore-dangle */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object'
}

export async function _import<T>(path: string, esm?: boolean): Promise<T>
export async function _import<T>(path?: string, esm?: boolean): Promise<T | null>
export async function _import<T>(path?: string, esm = true): Promise<T | null> {
  if (!path) return null

  const module = await import(path)

  if (esm && module && isObject(module)) return ('default' in module ? module.default : module) as T

  return module as T
}
