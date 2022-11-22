import { IHost as IHost } from '../interfaces/IHost'

export class Host {
  public extensionBundle: IHost.ExtensionBundle = {
    id: 'Microsoft.Azure.Functions.ExtensionBundle',
    version: '[3.*, 4.0.0)'
  }

  public logging: IHost.Logging = {
    applicationInsights: {
      samplingSettings: {
        isEnabled: true,
        excludedTypes: 'Request'
      }
    }
  }

  constructor(host: IHost = {}) {
    this.set(host)
  }

  public set({
    aggregator,
    extensions,
    functionTimeout,
    functions,
    healthMonitor,
    logging,
    managedDependency,
    singleton,
    version,
    watchDirectories,
    watchFiles
  }: IHost = {}) {
    if (aggregator !== undefined) this.aggregator = aggregator
    if (extensions !== undefined) this.extensions = extensions
    if (functionTimeout !== undefined) this.functionTimeout = functionTimeout
    if (functions !== undefined) this.functions = functions
    if (healthMonitor !== undefined) this.healthMonitor = healthMonitor
    if (logging !== undefined) this.logging = logging
    if (managedDependency !== undefined) this.managedDependency = managedDependency
    if (singleton !== undefined) this.singleton = singleton
    if (version !== undefined) this.version = version
    if (watchDirectories !== undefined) this.watchDirectories = watchDirectories
    if (watchFiles !== undefined) this.watchFiles = watchFiles

    return this
  }
}

export interface Host extends IHost {}
