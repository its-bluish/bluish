import globCallback, { IOptions } from 'glob'
import { promisify } from 'util'

const globAsync = promisify(globCallback)

export const glob = async (pattern: string | string[], options?: IOptions) => {
  const patterns = Array.isArray(pattern) ? pattern : [pattern]

  const paths = await Promise.all(patterns.map(pattern => globAsync(pattern, options)))

  return paths.flat(1)
}
