import fs from 'fs/promises'

export function exists(path: string) {
  return fs.stat(path).then(() => true, () => false)
}
