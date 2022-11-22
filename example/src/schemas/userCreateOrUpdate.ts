import * as Yup from 'yup'
import { User } from '../entities/User'
import bcrypt from 'bcrypt'

const schema = Yup.object({
  id: Yup.string().optional().uuid(),
  email: Yup.string().email().required().test({
    test: async email => !await User.findOneBy({ email })
  }),
  nickname: Yup.string().min(2).required(),
  firstName: Yup.string().min(2).required(),
  lastName: Yup.string().min(2).required(),
  username: Yup.string().min(1).required().test({
    test: async username => !await User.findOneBy({ username })
  }),
  password: Yup.string().min(8).required().transform(password => bcrypt.hashSync(password, 10)),
  passwordConfirm: Yup.string().when('password', (password, field: Yup.StringSchema) => {
    if (!password) return field

    return field.test({
      test: async (confirm) => {
        if (!confirm) return false
        return await bcrypt.compare(confirm, password)
      }
    })
  })
})

export const userCreateOrUpdateSchema = Yup.mixed().when({
  is: Array.isArray,
  then: Yup.array(schema),
  otherwise: schema
})
