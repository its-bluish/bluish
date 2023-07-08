import fs from 'fs/promises'

export async function fsPromiseExists(path: string): Promise<boolean> {
  return await fs.stat(path).then(
    () => true,
    () => false,
  )
}
