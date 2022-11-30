import { Http, Use, } from '@bluish/core'

import { User } from '../entities/User'
import { Schema } from '../handlers/Schema'
import { UseEntity } from '../handlers/UseEntity'
import { userUpdateSchema } from '../schemas/userUpdate'
import { userCreateSchema } from '../schemas/userCreate'
import { userCreateOrUpdateSchema } from '../schemas/userCreateOrUpdate'
import { DeepPartial } from 'typeorm'
import BluishUrlencodedPlugin from '@bluish/plugin-urlencoded'

@Use(new BluishUrlencodedPlugin({ extended: false }))
@Http.Header('Content-Type', 'application/json')
export class Users {
  @Http.Get('/users')
  @Schema.Query(Yup => ({
    page: Yup.number().integer().min(1).default(1),
    take: Yup.number().integer().min(1).max(50).default(20)
  }))
  @Http.Status(200)
  public async find(
    @Http.Query('take') take: number,
    @Http.Query('page') page: number,
  ) {
    const skip = take * (page - 1)

    const [users, count] = await User.findAndCount({ take, skip })

    const end = take * page >= count

    return { count, end, users }
  }

  @Http.Post('/users')
  @UseEntity(User, '$body')
  @Schema.Body(userCreateSchema)
  public async create(@Http.Body() user: User) {
    return await User.save(user)
  }

  @Http.Put('/users')
  @Schema.Body(userCreateOrUpdateSchema)
  @UseEntity(User, '$body')
  public async save(@Http.Body() user: User) {
    return await User.save(user)
  }

  @Http.Patch('/users/{user}')
  @Schema.Body(userUpdateSchema, {
    context: context => ({ user: context.params.user })
  })
  @UseEntity(User, 'user')
  public async update(
    @Http.Param('user') user: User,
    @Http.Body() updates: DeepPartial<User>
  ) {
    return await Object.assign(user, updates).save()
  }

  @Http.Delete('/users/{user}')
  @UseEntity(User, 'user')
  public async remove(@Http.Param('user') user: User) {
    await user.remove()
  }
}
