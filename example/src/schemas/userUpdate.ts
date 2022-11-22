import { Not } from 'typeorm'
import * as Yup from 'yup'
import { User } from '../entities/User'
import bcrypt from 'bcrypt'

export const userUpdateSchema = Yup.object({
  email: Yup.string().email()
    .when('$user', (user: User, schema: Yup.StringSchema) => schema.test({
      test: async email => !email || !await User.findOneBy({ email, id: Not(user.id) })
    })),
  nickname: Yup.string().min(2),
  firstName: Yup.string().min(2),
  lastName: Yup.string().min(2),
  username: Yup.string().min(2)
    .when('$user', (user: User, schema: Yup.StringSchema) => schema.test({
      test: async username => !username || !await User.findOneBy({ username, id: Not(user.id) })
    })),
  password: Yup.string().min(8).transform(password => bcrypt.hashSync(password, 10)),
  oldPassword: Yup.string().min(8)
    .when('password', (value, schema: Yup.StringSchema) => value ? schema.required() : schema)
    .when('$user', (user: User, schema: Yup.StringSchema) => {
      return schema.test({
        test: async (password) => !password || await bcrypt.compare(password, user.password)
      })
    }),
  passwordConfirm: Yup.string()
    .when('password', (password, field: Yup.StringSchema) => {
      if (!password) return field
  
      return field.required().test({
        test: async (confirm) => {
          if (!confirm) return false
          return await bcrypt.compare(confirm, password)
        }
      })
    })
})
