import { Source, TriggerConfiguration } from '@bluish/core'
import { MODULE_EXPORT_NAME } from '../constants'
import { Builder } from './Builder'
import { Configuration } from './Configuration'
import { TriggerBuilder } from './TriggerBuilder'

export class TriggerBuilderCollection {
  private readonly _triggerBuilders: TriggerBuilder[] = []

  public static fromTriggers(
    triggers: TriggerConfiguration[],
    builder: Builder,
    configuration: Configuration,
  ) {
    const triggerBuilderCollection = new TriggerBuilderCollection(builder, configuration)

    triggers.forEach((trigger) => {
      triggerBuilderCollection.add(trigger)
    })

    return triggerBuilderCollection
  }

  constructor(protected builder: Builder, protected configuration: Configuration) {}

  public add(
    trigger: TriggerConfiguration,
    TriggerBuilderConstructor: new (
      triggerConfiguration: TriggerConfiguration,
      builder: Builder,
      configuration: Configuration,
      collection: TriggerBuilderCollection,
    ) => TriggerBuilder = TriggerBuilder,
  ) {
    const triggerBuilder = new TriggerBuilderConstructor(
      trigger,
      this.builder,
      this.configuration,
      this,
    )

    this._triggerBuilders.push(triggerBuilder)

    return triggerBuilder
  }

  public remove(triggerBuilder: TriggerBuilder) {
    this._triggerBuilders.splice(this._triggerBuilders.indexOf(triggerBuilder), 1)
  }

  public updateByFilePath(trigger: TriggerConfiguration) {
    const maybeTriggerBuilder = this._triggerBuilders.find(
      (triggerBuilder) =>
        trigger.source.classFilePath === triggerBuilder.trigger.source.classFilePath,
    )

    if (!maybeTriggerBuilder) return this.add(trigger)

    const triggerBuilder = this.add(trigger)

    this._triggerBuilders.splice(
      this._triggerBuilders.indexOf(maybeTriggerBuilder),
      1,
      triggerBuilder,
    )

    return triggerBuilder
  }

  public hasTriggerWithSameName(triggerBuilder: TriggerBuilder) {
    return this._triggerBuilders.some((maybeThatTriggerBuilder) => {
      if (maybeThatTriggerBuilder.trigger.name !== triggerBuilder.trigger.name) return false
      return maybeThatTriggerBuilder !== triggerBuilder
    })
  }

  public findByFilePath(filePath: string) {
    return this._triggerBuilders.filter((triggerBuilder) =>
      filePath.includes(triggerBuilder.trigger.source.classFilePath),
    )
  }

  public async removeByFilePath(filePath: string) {
    const triggers = this.findByFilePath(filePath)

    await Promise.all(triggers.map(async (trigger) => trigger.remove()))

    triggers.forEach((trigger) => {
      this.remove(trigger)
    })
  }

  public addByModuleExport(module: Record<string, Function>) {
    return Object.entries(module)
      .map(([moduleExportName, constructor]) =>
        Object.assign(constructor, { [MODULE_EXPORT_NAME]: moduleExportName }),
      )
      .filter((constructor) => typeof constructor === 'function')
      .flatMap((trigger) => Source.get(trigger)?.triggers.toArray())
      .filter(<T>(item: T): item is Exclude<T, undefined> => !!item)
      .map((trigger) => this.add(trigger))
  }

  public async addByModuleExportAndBuild(module: Record<string, Function>) {
    await Promise.all(
      this.addByModuleExport(module).map(async (triggerBuilder) => triggerBuilder.build()),
    )
  }

  public async build() {
    await Promise.all(this._triggerBuilders.map(async (triggerBuilder) => triggerBuilder.build()))
  }
}
