import { IHost } from '../interfaces/IHost'
import { deepAssign } from '../tools/deepAssign'

export class Host {
  public extensionBundle: IHost.ExtensionBundle = {
    id: 'Microsoft.Azure.Functions.ExtensionBundle',
    version: '[3.*, 4.0.0)',
  }

  public logging: IHost.Logging = {
    applicationInsights: {
      samplingSettings: {
        isEnabled: true,
        excludedTypes: 'Request',
      },
    },
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
    watchFiles,
  }: IHost = {}) {
    if (aggregator !== void 0) this.aggregator = aggregator
    if (extensions !== void 0) deepAssign((this.extensions ??= {}), extensions)
    if (functionTimeout !== void 0) this.functionTimeout = functionTimeout
    if (functions !== void 0) this.functions = functions
    if (healthMonitor !== void 0) this.healthMonitor = healthMonitor
    if (logging !== void 0) this.logging = logging
    if (managedDependency !== void 0) this.managedDependency = managedDependency
    if (singleton !== void 0) this.singleton = singleton
    if (version !== void 0) this.version = version
    if (watchDirectories !== void 0) this.watchDirectories = watchDirectories
    if (watchFiles !== void 0) this.watchFiles = watchFiles

    return this
  }
}

export interface Host extends IHost {}
