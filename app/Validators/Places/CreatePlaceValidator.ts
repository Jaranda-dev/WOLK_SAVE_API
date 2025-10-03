import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePlaceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    lat: schema.number(),
    long: schema.number(),
    name: schema.string({}, [rules.minLength(2), rules.maxLength(255)]),
    type: schema.enum(['routepoints', 'incident', 'desviation'] as const),
  })
  public messages: CustomMessages = {}
}
