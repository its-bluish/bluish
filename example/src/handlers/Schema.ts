import { ObjectShape } from "yup/lib/object";
import * as Yup from 'yup'
import { HttpContext, OnInitialize } from "@bluish/core";

type SchemaFactory<S> = S | Yup.AnySchema | ((yup: typeof Yup) => S | Yup.AnySchema)

export interface SchemaOptions {
  context?: (context: HttpContext<any>) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export namespace Schema {
  function parse<S extends ObjectShape>(shapeOrShapeFactory: SchemaFactory<S>, { context: contextFactory }: SchemaOptions = {}) {
    const shapeOrSchema = typeof shapeOrShapeFactory === 'function'
      ? shapeOrShapeFactory(Yup)
      : shapeOrShapeFactory

    const schema = Yup.isSchema(shapeOrSchema)
      ? shapeOrSchema
      : Yup.object(shapeOrSchema)

    const opts = async (context: HttpContext<any>) => ({
      context: await contextFactory?.(context)
    })

    return { schema, opts }
  }

  export function Query<S extends ObjectShape>(shapeOrShapeFactory: SchemaFactory<S>, options?: SchemaOptions) {
    return OnInitialize(async (context: HttpContext<any>) => {
      const { schema, opts } = parse(shapeOrShapeFactory, options)

      context.query = await schema.validate(context.query, {
        abortEarly: false,
        ...await opts(context),
      })
    })
  }

  export function Body<S extends ObjectShape>(shapeOrShapeFactory: SchemaFactory<S>, options?: SchemaOptions) {
    return OnInitialize(async (context: HttpContext<any>) => {
      const { schema, opts } = parse(shapeOrShapeFactory, options)

      context.body = await schema.validate(context.body, {
        abortEarly: false,
        ...await opts(context),
      })
    })
  }
}
