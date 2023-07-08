import { SourceMetadata } from '@bluish/core'

export class HttpSourceBinder {
  public path: string | null = null

  public version: number | null = null

  constructor(public sourceMetadata: SourceMetadata) {}
}

SourceMetadata.binders.http = sourceMetadataArgsStorage =>
  new HttpSourceBinder(sourceMetadataArgsStorage)

declare global {
  namespace Bluish {
    interface SourceMetadataBinders {
      http: HttpSourceBinder
    }
  }
}
