import { Metadata, Trigger } from "@bluish/core";
import { MODULE_EXPORT_NAME } from "../constants";
import { Builder } from "./Builder";
import { Configuration } from "./Configuration";
import { TriggerBuilder } from "./TriggerBuilder";

export class TriggerBuilderCollection {
  private _triggerBuilders: TriggerBuilder[] = []
  
  public static fromTriggers(triggers: Trigger[], builder: Builder, configuration: Configuration) {
    const triggerBuilderCollection = new TriggerBuilderCollection(builder, configuration)

    triggers.forEach(trigger => {
      triggerBuilderCollection.add(trigger)
    })

    return triggerBuilderCollection
  }

  constructor(protected builder: Builder, protected configuration: Configuration) {}

  public add(
    trigger: Trigger,
  ) {
    const triggerBuilder = new TriggerBuilder(trigger, this.builder, this.configuration, this)

    this._triggerBuilders.push(triggerBuilder)

    return triggerBuilder
  }

  public remove(triggerBuilder: TriggerBuilder) {
    this._triggerBuilders.splice(
      this._triggerBuilders.indexOf(triggerBuilder),
      1
    )
  }

  public updateByFilePath(trigger: Trigger) {
    const maybeTriggerBuilder =  this._triggerBuilders.find(triggerBuilder => {
      return trigger.metadata.classFilePath === triggerBuilder.trigger.metadata.classFilePath
    })

    if (!maybeTriggerBuilder) return this.add(trigger)

    const triggerBuilder = this.add(trigger)

    this._triggerBuilders.splice(this._triggerBuilders.indexOf(maybeTriggerBuilder), 1, triggerBuilder)

    return triggerBuilder
  }

  public hasTriggerWithSameName(triggerBuilder: TriggerBuilder) {
    return this._triggerBuilders.some(maybeThatTriggerBuilder => {
      if (maybeThatTriggerBuilder.trigger.name !== triggerBuilder.trigger.name) return false
      return maybeThatTriggerBuilder !== triggerBuilder
    })
  }

  public findByFilePath(filePath: string) {
    return this._triggerBuilders.filter(triggerBuilder => {
      return filePath.includes(triggerBuilder.trigger.metadata.classFilePath)
    })
  }

  public async removeByFilePath(filePath: string) {
    const triggers = this.findByFilePath(filePath)

    await Promise.all(triggers.map(trigger => trigger.remove()))

    triggers.forEach(trigger => this.remove(trigger))
  }

  public addByModuleExport(module: Record<string, Function>) {
    return Object.entries(module)
      .map(([moduleExportName, constructor]) => Object.assign(constructor, { [MODULE_EXPORT_NAME]: moduleExportName }))
      .filter(constructor => typeof constructor === 'function')
      .flatMap((trigger) => Metadata.load(trigger, true).triggers.toArray())
      .filter(<T>(item: T): item is Exclude<T, undefined> => !!item)
      .map(trigger => this.add(trigger))
  }

  public async addByModuleExportAndBuild(module: Record<string, Function>) {
    await Promise.all(this.addByModuleExport(module).map(triggerBuilder => triggerBuilder.build()))
  }

  public async build() {
    await Promise.all(this._triggerBuilders.map(triggerBuilder => triggerBuilder.build()))
  }
}
