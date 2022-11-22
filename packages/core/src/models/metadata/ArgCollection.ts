import { Collection } from "../Collection";
import { Context } from "../contexts/Context";
import { Arg } from "./Arg";
import { Trigger } from "./Trigger";

export class ArgCollection<C extends Context = any> extends Collection<Arg<C>> {
  constructor(protected trigger: Trigger) {
    super()
  }

  protected beforeAdd(item: Arg<C>): void {
    item.trigger = this.trigger
  }

  public async toArguments(context: C) {
    return await Promise.all(this.toArray().map(arg => arg.factory(context)))
  }
}
