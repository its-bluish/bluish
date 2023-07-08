import { getSourceMetadata } from '@bluish/core'

export function Path(path: string) {
  return (target: Object | Function, propertyKey?: string) => {
    if (typeof target === 'function') {
      getSourceMetadata(target).useBinder('http').path = path

      return void 0
    }

    if (typeof propertyKey !== 'string') throw new Error('TODO')

    getSourceMetadata(target.constructor)
      .getSourceTriggerMetadata(propertyKey)
      .useBinder('http').path = path
  }
}
