import { Context } from '../models/contexts/Context'
import { Metadata } from '../models/metadata'
import { Arg, ArgFactory } from '../models/metadata/Arg'
import { wait } from '../tools/wait'

export function Bind<C extends Context>(factory: ArgFactory<C> = (context) => context) {
  return (target: Object, property: string, index: number) => {
    void wait
      .any(target, property)
      .then((metadata) => {
        if (metadata instanceof Metadata) return metadata

        throw new Error('TODO')
      })
      .then((metadata) => {
        metadata.triggers
          .findOneByPropertyOrFail(property)
          .args.set(index, new Arg<C>(factory) as Arg<Context>)
      })
  }
}
