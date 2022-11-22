import { Bind, HttpContext, HttpTrigger } from '@bluish/core'

import { User } from '../entities/User'
import { Schema } from '../handlers/Schema'
import { UseEntity } from '../handlers/UseEntity'
import { userUpdateSchema } from '../schemas/userUpdate'
import { userCreateSchema } from '../schemas/userCreate'
import { userCreateOrUpdateSchema } from '../schemas/userCreateOrUpdate'
import { DeepPartial } from 'typeorm'

export class Users {
  @HttpTrigger.Get('/users')
  @Schema.Query(Yup => ({
    page: Yup.number().integer().min(1).default(1),
    take: Yup.number().integer().min(1).max(50).default(20)
  }))
  public async find(
    @HttpTrigger.Query('take') take: number,
    @HttpTrigger.Query('page') page: number,
  ) {
    const skip = take * (page - 1)

    const [users, count] = await User.findAndCount({ take, skip })

    const end = take * page >= count

    return { count, end, users }
  }

  @HttpTrigger.Post('/users')
  @UseEntity(User, '$body')
  @Schema.Body(userCreateSchema)
  public async create(@HttpTrigger.Body() user: User) {
    return await User.save(user)
  }

  @HttpTrigger.Put('/users')
  @Schema.Body(userCreateOrUpdateSchema)
  @UseEntity(User, '$body')
  public async save(@HttpTrigger.Body() user: User) {
    return await User.save(user)
  }

  @HttpTrigger.Patch('/users/{user}')
  @Schema.Body(userUpdateSchema, {
    context: context => ({ user: context.params.user })
  })
  @UseEntity(User, 'user')
  public async update(
    @HttpTrigger.Param('user') user: User,
    @HttpTrigger.Body() updates: DeepPartial<User>
  ) {
    return await Object.assign(user, updates).save()
  }

  @HttpTrigger.Delete('/users/{user}')
  @UseEntity(User, 'user')
  public async remove(@HttpTrigger.Param('user') user: User) {
    await user.remove()
  }
}
