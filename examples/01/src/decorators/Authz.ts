import { OnBefore } from '@bluish/core'
import { HttpContext } from '@bluish/http'
import jwt from 'jsonwebtoken'
import createHttpError from 'http-errors'

const { Unauthorized } = createHttpError

export function Authz(...scopes: Array<string | string[]>) {
  return OnBefore(async event => {
    if (!(event.context instanceof HttpContext)) return

    const authorization = event.context.request.headers
      .get('authorization')
      ?.replace(/^Bearer /, '')

    if (!authorization) throw new Unauthorized()

    const token = await new Promise<string | jwt.JwtPayload>(
      (resolve, reject) => {
        jwt.verify(authorization, '123', {}, (error, decoded) => {
          if (error ?? !decoded)
            return reject(createHttpError(401, { cause: error }))

          resolve(decoded)
        })
      },
    )

    if (typeof token !== 'object') throw new Unauthorized()

    if (!Array.isArray(token.scopes)) throw new Unauthorized()

    const allow = scopes.some(scope => {
      if (Array.isArray(scope))
        return scope.every(scope => token.scopes.includes(scope))

      return scope.includes(scope)
    })

    if (!allow) throw new Unauthorized()
  })
}
