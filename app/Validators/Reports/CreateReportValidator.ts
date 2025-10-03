import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateReportValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}, [rules.minLength(3), rules.maxLength(255)]),
    description: schema.string.optional({}, [rules.maxLength(500)]),
    incidentId: schema.number([
      rules.exists({ table: 'incidents', column: 'id' }) // verificar que el incidente exista
    ]),
  })
  public messages: CustomMessages = {}
}
