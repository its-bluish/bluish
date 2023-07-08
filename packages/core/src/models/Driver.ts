import { type ConstructorOf } from '../typings/helpers.js'
import { type Frame } from './Frame.js'
import { type SourceTriggerBinder } from './SourceTriggerBinder.js'

export interface DriverSourceImportDetails {
  path: string
  key: string
}

interface ApplicationDetails {
  source: string
  dist: string
  exportName: string
  exportAlias: string
}

export abstract class Driver<TSourceTriggerBinder extends SourceTriggerBinder> {
  protected useFrame!: <TFrame extends Frame>(
    frame: ConstructorOf<TFrame>,
  ) => TFrame

  public static application: ApplicationDetails | null = null

  public get hasApplication(): boolean {
    return !!this.constructor.application
  }

  public get applicationSourcePath(): string {
    if (!this.constructor.application) throw new Error('TODO')

    return this.constructor.application.source
  }

  public get applicationPath(): string {
    if (!this.constructor.application) throw new Error('TODO')

    return this.constructor.application.dist
  }

  public get applicationExportName(): string {
    if (!this.constructor.application) throw new Error('TODO')

    return this.constructor.application.exportName
  }

  public get applicationExportAlias(): string {
    if (!this.constructor.application) throw new Error('TODO')

    return this.constructor.application.exportAlias
  }

  public sourceDirectory!: string

  public outputDirectory!: string

  public abstract to():
    | ConstructorOf<TSourceTriggerBinder>
    | Array<ConstructorOf<TSourceTriggerBinder>>
    | Promise<
        | ConstructorOf<TSourceTriggerBinder>
        | Array<ConstructorOf<TSourceTriggerBinder>>
      >

  public abstract up(
    sourceTriggerBinder: TSourceTriggerBinder,
    importDetails: DriverSourceImportDetails,
  ): void | Promise<void>

  public abstract refresh(
    sourceTriggerBinder: TSourceTriggerBinder,
    oldSourceTriggerBinder: TSourceTriggerBinder,
    importDetails: DriverSourceImportDetails,
  ): void | Promise<void>

  public abstract down(
    sourceTriggerBinder: TSourceTriggerBinder,
    importDetails: DriverSourceImportDetails,
  ): void | Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Driver<TSourceTriggerBinder extends SourceTriggerBinder> {
  constructor: typeof Driver
}
