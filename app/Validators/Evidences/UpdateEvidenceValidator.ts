import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateEvidenceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    fileType: schema.string.optional({}, [rules.minLength(1), rules.maxLength(50)]),
    path: schema.string.optional({}, [rules.minLength(3), rules.maxLength(255)]),
    incidentId: schema.number.optional([
      rules.exists({ table: 'incidents', column: 'id' })
    ]),
  })

  
  public messages: CustomMessages = {}
}
