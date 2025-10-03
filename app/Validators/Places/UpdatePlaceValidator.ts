import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePlaceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    lat: schema.number.optional(),
    long: schema.number.optional(),
    name: schema.string.optional({}, [rules.minLength(2), rules.maxLength(255)]),
    type: schema.enum.optional(['routepoints', 'incident', 'desviation'] as const),
  })
  public messages: CustomMessages = {}
}
