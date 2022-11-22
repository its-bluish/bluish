export interface IHost {
  version?: string
  /**
   * Specifies how many function invocations are aggregated when calculating metrics for Application Insights.
   * 
   * Function invocations are aggregated when the first of the two limits are reached.
   */
  aggregator?: IHost.Aggregator
  extensions?: IHost.Extensions
  extensionBundle?: IHost.ExtensionBundle
  functions?: string[]
  functionTimeout?: string
  healthMonitor?: IHost.HealthMonitor
  /**
   * Controls the logging behaviors of the function app, including Application Insights.
   */
  logging?: IHost.Logging
  managedDependency?: IHost.ManagedDependency
  singleton?: IHost.Singleton
  watchDirectories?: string[]
  watchFiles?: string
}

export namespace IHost {
  export interface Aggregator {
    /**
     * Maximum number of requests to aggregate.
     * 
     * @default 1000
     */
    batchSize?: number
    /**
     * Maximum time period to aggregate.
     * 
     * @default "00:00:30"
     */
    flushTimeout?: string
  }

  export interface Extensions {
    blobs?: Record<string, unknown>
    cosmosDb?: Record<string, unknown>
    durableTask?: Record<string, unknown>
    eventHubs?: Record<string, unknown>
    http?: Extensions.Http
    queues?: Record<string, unknown>
    sendGrid?: Record<string, unknown>
    serviceBus?: Record<string, unknown>
  }

  export namespace Extensions {
    export interface Http {
      /**
       * The route prefix that applies to all routes. Use an empty string to remove the default prefix.
       * 
       * @default "api"
       */
      routePrefix?: string,
      /**
       * The maximum number of outstanding requests that are held at any given time. This limit includes
       * requests that are queued but have not started executing, as well as any in progress executions.
       * Any incoming requests over this limit are rejected with a 429 "Too Busy" response.
       * That allows callers to employ time-based retry strategies, and also helps you to control maximum
       * request latencies. This only controls queuing that occurs within the script host execution path.
       * Other queues such as the ASP.NET request queue will still be in effect and unaffected by this setting. 
       * *The default for a Consumption plan is 200. The default for a Dedicated plan is unbounded (-1).
       * 
       * @default 200
       */
      maxOutstandingRequests?: number,
      /**
       * The maximum number of HTTP functions that are executed in parallel.
       * This value allows you to control concurrency, which can help manage resource utilization.
       * For example, you might have an HTTP function that uses a large number of system resources
       * (memory/cpu/sockets) such that it causes issues when concurrency is too high.
       * Or you might have a function that makes outbound requests to a third-party service,
       * and those calls need to be rate limited. In these cases, applying a throttle here can help.
       * *The default for a Consumption plan is 100. The default for a Dedicated plan is unbounded (-1).
       * 
       * @default 100
       */
      maxConcurrentRequests?: number,
      /**
       * When enabled, this setting causes the request processing pipeline to periodically check
       * system performance counters like connections/threads/processes/memory/cpu/etc and if any of
       * those counters are over a built-in high threshold (80%), requests will be rejected with a 429
       * "Too Busy" response until the counter(s) return to normal levels.
       * *The default in a Consumption plan is true. The default in a Dedicated plan is false.
       * 
       * @default true
       */
      dynamicThrottlesEnabled?: boolean,
      /**
       * When isEnabled is set to true, the HTTP Strict Transport Security (HSTS) behavior of .NET Core
       * is enforced, as defined in the HstsOptions class. The above example also sets the maxAge property
       * to 10 days. Supported properties of hsts are:
       * 
       * @default undefined
       */
      hsts?: {
        /**
         * A string array of host names for which the HSTS header isn't added.
         */
        excludedHosts?: string[]
        /**
         * Boolean value that indicates whether the includeSubDomain parameter of the Strict-Transport-Security header is enabled.
         */
        includeSubDomains?: boolean
        /**
         * String that defines the max-age parameter of the Strict-Transport-Security header.
         */
        maxAge?: string
        /**
         * Boolean that indicates whether the preload parameter of the Strict-Transport-Security header is enabled.
         */
        preload?: boolean
        /**
         * @default false
         */
        isEnabled?: boolean,
      },
      customHeaders?: Record<string, unknown>
    }
  }

  export interface ExtensionBundle {
    id?: string
    version?: string
  }
  
  export interface HealthMonitor {
    enabled?: boolean
    healthCheckInterval?: string
    healthCheckWindow?: string
    healthCheckThreshold?: number
    counterThreshold?: number
  }

  export interface Logging {
    /**
     * Defines what level of file logging is enabled.
     * 
     * @default debugOnly
     */
    fileLoggingMode?: 'never' | 'always' | 'debugOnly'
    /**
     * Object that defines the log category filtering for functions in the app.
     * This setting lets you filter logging for specific functions.
     */
    logLevel?: Record<string, 'Trace' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Critical' | 'None'>
    /**
     * The applicationInsights setting.
     */
    applicationInsights?: Logging.ApplicationInsights
  }
  
  export namespace Logging {
    export interface ApplicationInsights {
      samplingSettings?: ApplicationInsights.SamplingSettings
      /**
       * Enables live metrics collection.
       * 
       * @default true
       */
      enableLiveMetrics?: boolean
      /**
       * Enables dependency tracking.
       * 
       * @default true
       */
      enableDependencyTracking?: boolean
      /**
       * Enables Kudu performance counters collection.
       * 
       * @default true
       */
      enablePerformanceCountersCollection?: boolean
      /**
       * For internal use only.
       * 
       * @default "00:00:15"
       */
      liveMetricsInitializationDelay?: string
      /**
       * @see {@link https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json#applicationinsightshttpautocollectionoptions}
       */
      httpAutoCollectionOptions?: ApplicationInsights.HttpAutoCollectionOptions
      /**
       * @see {@link https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json#applicationinsightssnapshotconfiguration}
       */
      snapshotConfiguration?: ApplicationInsights.SnapshotConfiguration
    }

    export namespace ApplicationInsights {
      export interface SamplingSettings {
        /**
         * Enables or disables sampling.
         * 
         * @default true
         */
        isEnabled?: boolean
        /**
         * The target number of telemetry items logged per second on each server host.
         * If your app runs on many hosts, reduce this value to remain within your overall target rate of traffic.
         * 
         * @default 20
         */
        maxTelemetryItemsPerSecond?: number
        /**
         * The interval at which the current rate of telemetry is reevaluated. Evaluation is
         * performed as a moving average. You might want to shorten this interval if your
         * telemetry is liable to sudden bursts.
         * 
         * @default "01:00:00"
         */
        evaluationInterval?: string
        /**
         * The initial sampling percentage applied at the start of the sampling process
         * to dynamically vary the percentage. Don't reduce value while you're debugging.
         * 
         * @default 100.0
         */
        initialSamplingPercentage?: number
        /**
         * When the sampling percentage value changes, this property determines how soon
         * afterwards Application Insights is allowed to raise sampling percentage again
         * to capture more data.
         * 
         * @default "00:00:01
         */
        samplingPercentageIncreaseTimeout?: string
        /**
         * When the sampling percentage value changes, this property determines how soon
         * afterwards Application Insights is allowed to lower sampling percentage
         * again to capture less data.
         * 
         * @default "00:00:01
         */
        samplingPercentageDecreaseTimeout?: string
        /**
         * As sampling percentage varies, this property determines the minimum allowed sampling percentage.
         * 
         * @default 0.1
         */
        minSamplingPercentage?: number
        /**
         * As sampling percentage varies, this property determines the maximum allowed sampling percentage.
         * 
         * @default 100.0
         */
        maxSamplingPercentage?: number
        /**
         * In the calculation of the moving average, the weight assigned to the
         * most recent value. Use a value equal to or less than 1. Smaller values
         * make the algorithm less reactive to sudden changes.
         * 
         * @default 1.0
         */
        movingAverageRatio?: number
        /**
         * A semi-colon delimited list of types that you don't want to be sampled.
         * Recognized types are: Dependency, Event, Exception, PageView, Request, and Trace.
         * All instances of the specified types are transmitted; the types that aren't specified are sampled.
         * 
         * @default null
         */
        excludedTypes?: string
        /**
         * A semi-colon delimited list of types that you want to be sampled; an empty list implies all types.
         * Type listed in excludedTypes override types listed here.
         * Recognized types are: Dependency, Event, Exception, PageView, Request, and Trace.
         * Instances of the specified types are sampled; the types that aren't specified or
         * implied are transmitted without sampling.
         * 
         * @default null
         */
        includedTypes?: string
      }

      export interface HttpAutoCollectionOptions {
        /**
         * Enables or disables extended HTTP request information for
         * HTTP triggers: incoming request correlation headers,
         * multi-instrumentation keys support, HTTP method, path, and response.
         * 
         * @default true
         */
        enableHttpTriggerExtendedInfoCollection?: boolean
        /**
         * Enables or disables support of W3C distributed tracing
         * protocol (and turns on legacy correlation schema).
         * Enabled by default if enableHttpTriggerExtendedInfoCollection is true.
         * If enableHttpTriggerExtendedInfoCollection is false, this flag applies
         * to outgoing requests only, not incoming requests.
         * 
         * @default true
         */
        enableW3CDistributedTracing?: boolean
        /**
         * Enables or disables injection of multi-component correlation headers into responses.
         * Enabling injection allows Application Insights to construct an Application Map
         * to when several instrumentation keys are used.
         * Enabled by default if enableHttpTriggerExtendedInfoCollection is true.
         * This setting doesn't apply if enableHttpTriggerExtendedInfoCollection is false.
         * 
         * @default true
         */
        enableResponseHeaderInjection?: boolean
      }

      export interface SnapshotConfiguration {
        agentEndpoint?: null
        captureSnapshotMemoryWeight?: number
        failedRequestLimit?: number
        handleUntrackedExceptions?: boolean
        isEnabled?: boolean
        isEnabledInDeveloperMode?: boolean
        isEnabledWhenProfiling?: boolean
        isExceptionSnappointsEnabled?: boolean
        isLowPrioritySnapshotUploader?: boolean
        maximumCollectionPlanSize?: number
        maximumSnapshotsRequired?: number
        problemCounterResetInterval?: string
        provideAnonymousTelemetry?: boolean
        reconnectInterval?: string
        shadowCopyFolder?: null
        shareUploaderProcess?: boolean
        snapshotInLowPriorityThread?: boolean
        snapshotsPerDayLimit?: number
        snapshotsPerTenMinutesLimit?: number
        tempFolder?: null
        thresholdForSnapshotting?: number
        uploaderProxy?: null
      }
    }
  }

  export interface ManagedDependency {
    enabled?: boolean
  }

  export interface Singleton {
    lockPeriod?: string
    listenerLockPeriod?: string
    listenerLockRecoveryPollingInterval?: string
    lockAcquisitionTimeout?: string
    lockAcquisitionPollingInterval?: string
  }
}
