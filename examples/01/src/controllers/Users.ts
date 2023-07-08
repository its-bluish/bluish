import { Use } from '@bluish/core'
import {
  Body,
  DELETE,
  GET,
  PATCH,
  PUT,
  Param,
  Path,
  Json,
  UrlEncoded,
} from '@bluish/http'
import { Transaction } from '@bluish/typeorm'
import { QueryRunner } from 'typeorm'

import { User } from '../entities/User.js'
import { Pagination } from '../validators/Pagination.js'
import { Query } from '../decorators/Query.js'
import { Authz } from '../decorators/Authz.js'
import { database } from '../services/database.js'

@Path('/users')
@Use(new UrlEncoded({ extended: true }))
@Use(new Json())
@Param(
  'user',
  async userId =>
    await User.findOneOrFail({
      where: { id: userId },
      withDeleted: true,
    }),
)
export class Users {
  @GET
  @Authz('users:read')
  public async find(@Query { page, take }: Pagination) {
    const skip = (page - 1) * take

    return await User.find({ take, skip })
  }

  @PUT
  @Authz('users:write')
  public async save(
    @Transaction(database) transaction: QueryRunner,
    @Body body: Record<string, unknown>,
  ) {
    return await transaction.manager.save(User, body)
  }

  @PATCH('/:user')
  @Authz('users:write', 'users:{{user.id}}:write')
  public async update(
    @Param('user') user: User,
    @Body body: Record<string, unknown>,
  ) {
    return await Object.assign(user, body).save()
  }

  @GET('/:user')
  @Authz('users:read', 'users:{{user.id}}:read')
  public findOne(@Param('user') user: User) {
    return user
  }

  @DELETE('/:user')
  @Authz('users:remove', 'users:{{user.id}}:remove')
  public async remove(@Param('user') user: User) {
    await user.softRemove()
  }
}
