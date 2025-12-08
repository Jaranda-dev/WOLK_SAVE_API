import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VerifyCodeValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    code: schema.string({}, [rules.minLength(6), rules.maxLength(6)]),
  })

  public messages: CustomMessages = {
    'code.minLength': 'El código debe tener 6 dígitos',
    'code.maxLength': 'El código debe tener 6 dígitos',
    'email.required': 'El email es requerido',
  }
}
