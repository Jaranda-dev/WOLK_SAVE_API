import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateIncidentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    date: schema.date.optional({}),
    placeId: schema.number.optional([
      rules.exists({ table: 'places', column: 'id' })
    ]),
    routeRunId: schema.number.optional([
      rules.exists({ table: 'route_runs', column: 'id' })
    ]),
  })
  public messages: CustomMessages = {}
}
