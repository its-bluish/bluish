import { SourceTriggerMetadata, type SourceTriggerBinder } from '@bluish/core'

import { type HttpMethod } from '../typings/HttpMethod.js'

export class HttpSourceTriggerBinder implements SourceTriggerBinder {
  private _version: number | null = null

  public path: string | null = null

  public methods = new Set<HttpMethod>()

  private get _route(): string | null {
    const sourceMetadataPath =
      this.sourceTriggerMetadata.sourceMetadata.useBinder('http').path

    if (sourceMetadataPath && this.path)
      return `${sourceMetadataPath}${this.path}`

    if (this.path) return this.path

    if (sourceMetadataPath) return sourceMetadataPath

    return null
  }

  public get version(): number | null {
    if (this._version) return this.version

    return this.sourceTriggerMetadata.sourceMetadata.useBinder('http').version
  }

  public set version(version: number) {
    this._version = version
  }

  public get route(): string | null {
    return this._route
  }

  constructor(public sourceTriggerMetadata: SourceTriggerMetadata) {}
}

SourceTriggerMetadata.binders.http = sourceTriggerMetadata =>
  new HttpSourceTriggerBinder(sourceTriggerMetadata)

declare global {
  namespace Bluish {
    interface SourceTriggerBinders {
      http: HttpSourceTriggerBinder
    }
  }
}
