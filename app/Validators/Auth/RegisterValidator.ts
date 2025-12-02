import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.maxLength(255),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    password: schema.string({}, [
      rules.minLength(6),
      rules.maxLength(180),
    ]),
    password_confirmation: schema.string({}, [
      rules.confirmed('password'),
    ]),
    // Para registro, opcionalmente nombre o rol
    name: schema.string.optional({ trim: true }, [
      rules.maxLength(255),
    ]),
    roleId: schema.number.optional(),
  })
  
  public messages: CustomMessages = {}
}
