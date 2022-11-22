export async function _import<T>(path: string, esm?: boolean): Promise<T>
export async function _import<T>(path?: string, esm?: boolean): Promise<T | null>
export async function _import<T>(path?: string, esm = true): Promise<T | null> {
  if (!path) return null

  const module = await import(path)

  if (esm) return module.default ?? module

  return module
}
