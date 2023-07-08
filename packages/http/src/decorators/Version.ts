import { getSourceMetadata } from '@bluish/core'

export function Version(number: number) {
  return (target: Function | Object, propertyKey?: string) => {
    if (typeof target === 'function') {
      getSourceMetadata(target).useBinder('http').version = number

      return void 0
    }

    if (typeof propertyKey !== 'string') throw new Error('TODO')

    getSourceMetadata(target.constructor)
      .getSourceTriggerMetadata(propertyKey)
      .useBinder('http').version = number
  }
}
