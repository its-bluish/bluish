import { Query as BluishHttpQuery } from '@bluish/http'
import { validateOrReject } from 'class-validator'
import { plainToClass } from 'class-transformer'

import { ClassValidatorErrorCollection } from '../helpers/ClassValidatorErrorCollection.js'

export function Query(
  target: Object,
  propertyKey: string,
  parameterIndex: number,
) {
  return BluishHttpQuery(async query => {
    const ParamType: new () => object = Reflect.getMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    )[parameterIndex]
    const paramTypeInstance = plainToClass(ParamType, query, {
      enableImplicitConversion: true,
    })

    await validateOrReject(paramTypeInstance).catch(
      async errors =>
        await Promise.reject(
          new ClassValidatorErrorCollection(errors, 'query'),
        ),
    )

    return paramTypeInstance
  })(target, propertyKey, parameterIndex)
}
