import fs from 'fs/promises'

export async function exists(path: string) {
  return fs.stat(path).then(
    () => true,
    () => false,
  )
}
