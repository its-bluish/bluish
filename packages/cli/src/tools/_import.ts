import path from 'path'

export async function _import<T = any>(
  module: string,
  root?: string,
): Promise<T> {
  if (/^\.?\//.test(module))
    if (root) return await import(path.join(root, module))
    else return await import(module)

  try {
    return await import(module)
  } catch {
    if (root) return await import(path.join(root, module))
    else return await import(module)
  }
}
