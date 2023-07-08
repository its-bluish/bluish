import { type PathLike } from 'fs'
import fs from 'fs/promises'

export async function fsAsyncExists(path: PathLike): Promise<boolean> {
  return await fs.stat(path).then(
    () => true,
    () => false,
  )
}
