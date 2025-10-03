import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UpdateContactValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    phone: schema.string.optional({}, [rules.regex(/^[0-9]{10}$/)]),
    email: schema.string.optional({}, [
      rules.email(),
      rules.unique({ table: "contacts", column: "email" }), // opcionalmente puedes ignorar el mismo registro
    ]),
    name: schema.string.optional({}, [rules.minLength(3)]),
    direction: schema.string.optional({}, [rules.maxLength(255)]),
    userId: schema.number.optional([
      rules.exists({ table: "users", column: "id" }),
    ]),
  });

  public messages: CustomMessages = {};
}
