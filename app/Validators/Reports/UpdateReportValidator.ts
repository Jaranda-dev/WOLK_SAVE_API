import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateReportValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional({}, [rules.minLength(3), rules.maxLength(255)]),
    description: schema.string.optional({}, [rules.maxLength(500)]),
    incidentId: schema.number.optional([
      rules.exists({ table: 'incidents', column: 'id' })
    ]),
  })
  public messages: CustomMessages = {}
}
