const rule = /\(\/(?<filepath>.*):[0-9]+:[0-9]+\)$/

export function getDecoratedFilePath(constructor: Function) {
  const trace = { stack: '' }

  Error.captureStackTrace(trace, constructor)

  const file = trace.stack.split(/\n/g).find((file) => file.includes('__decorate'))

  if (!file && process.env.BLUISH_RUNNING_LOCAL_TESTS !== 'true')
    throw new Error('Could not find decorated triggers source path')

  if (!file) return ''

  const { filepath } = rule.exec(file)?.groups ?? {}

  return filepath
}
