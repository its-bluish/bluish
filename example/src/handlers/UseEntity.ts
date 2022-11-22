import { HttpContext, OnInitialize, OnDestroy, OnError, ErrorHandler } from "@bluish/core";
import { ObjectType, FindOneOptions, FindOptionsWhere } from "typeorm";
import { database } from "../services/database";
import { NotFound } from 'http-errors'

export interface UseEntityOptions<Entity extends Function> extends Omit<FindOneOptions<Entity>, 'where'> {
  ref?: string
}

export function UseEntity<Entity extends Function>(
  target: ObjectType<Entity>,
  param: string,
  { ref = 'id', ...options }: UseEntityOptions<Entity> = {}
) {
  return OnInitialize(async (context: HttpContext<any>) => {
    const repository = database.getRepository(target)

    if (param === '$body')

      return context.body = repository.create(context.body)

    const where = { [ref]: context.params[param] } as FindOptionsWhere<Entity>
    const data = await repository.findOne({
      ...options,
      where,
    })

    if (!data) throw new NotFound(`${target.name} Not Found`);

    context.params[param] = data
  })
}
