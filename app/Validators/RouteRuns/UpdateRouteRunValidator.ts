import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateRouteRunValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    routeId: schema.number.optional([
      rules.exists({ table: 'routes', column: 'id' })
    ]),
    userId: schema.number.optional([
      rules.exists({ table: 'users', column: 'id' })
    ]),
    startTime: schema.date.optional({}),
    endTime: schema.date.optional({}),
  })
  
  public messages: CustomMessages = {}
}
