import globCallback, { IOptions } from 'glob'
import { promisify } from 'util'

const globAsync = promisify(globCallback)

export const glob = async (patternOrPatterns: string | string[], options?: IOptions) => {
  const patterns = Array.isArray(patternOrPatterns) ? patternOrPatterns : [patternOrPatterns]

  const paths = await Promise.all(patterns.map(async (pattern) => globAsync(pattern, options)))

  return paths.flat(1)
}
