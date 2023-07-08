import { SourceMetadata } from '../models/SourceMetadata.js'
import { type ConstructorOf } from '../typings/helpers.js'

const globalScope: any = global

const bluishSourceMetadataMap: Map<
  ConstructorOf<any> | Function,
  SourceMetadata
> = (globalScope.bluishSourceMetadataArgsStorageMap ??= new Map())

export function getSourceMetadata(
  target: Function | ConstructorOf<any>,
  createIfNotExists?: true,
): SourceMetadata
export function getSourceMetadata(
  target: Function | ConstructorOf<any>,
  createIfNotExists: false,
): SourceMetadata | null
export function getSourceMetadata(
  target: Function | ConstructorOf<any>,
  createIfNotExists = true,
): SourceMetadata | null {
  if (!bluishSourceMetadataMap.has(target))
    if (!createIfNotExists) return null
    else
      bluishSourceMetadataMap.set(
        target,
        new SourceMetadata(target as ConstructorOf<any>),
      )

  return bluishSourceMetadataMap.get(target) as SourceMetadata
}
