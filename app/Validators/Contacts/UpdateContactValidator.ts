import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UpdateContactValidator {
  public schema

  constructor(protected ctx: HttpContextContract) {
    // build schema at runtime so we can access route params (current contact id)

    this.schema = schema.create({
      phone: schema.string.optional({}, [rules.regex(/^[0-9]{10}$/)]),
      email: schema.string.optional({},[rules.email()]),
      name: schema.string.optional({}, [rules.minLength(3)]),
      direction: schema.string.optional({}, [rules.maxLength(255)]),
      userId: schema.number.optional([
        rules.exists({ table: 'users', column: 'id' }),
      ]),
    })
  }

  public messages: CustomMessages = {};
}
