import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional({}, [rules.minLength(3), rules.maxLength(255)]),
    roleId: schema.number.optional([
      rules.exists({ table: 'roles', column: 'id' })
    ]),
    email: schema.string.optional({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string.optional({}, [rules.minLength(6)]),
    rememberMeToken: schema.string.optional({}, [rules.maxLength(255)]),
  })
  public messages: CustomMessages = {}
}
