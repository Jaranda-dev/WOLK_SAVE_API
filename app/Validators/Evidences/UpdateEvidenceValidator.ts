import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateEvidenceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    type: schema.enum.optional(['photo', 'audio'] as const),
    path: schema.string.optional({}, [rules.minLength(3), rules.maxLength(255)]),
    reportId: schema.number.optional([
      rules.exists({ table: 'reports', column: 'id' })
    ]),
  })

  
  public messages: CustomMessages = {}
}
