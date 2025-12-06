import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [rules.minLength(3), rules.maxLength(255)]),
    roleId: schema.number.optional([
      rules.exists({ table: 'roles', column: 'id' })
    ]),
    role: schema.string([
      rules.exists({ table: 'roles', column: 'name' })
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string({}, [rules.minLength(6)]),
  })
  public messages: CustomMessages = {}
}
