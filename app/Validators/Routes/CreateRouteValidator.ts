import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateRouteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    userId: schema.number.optional([
      rules.exists({ table: 'users', column: 'id' })
    ]),
    startPlaceId: schema.number([
      rules.exists({ table: "places", column: "id" }),
    ]),
    endPlaceId: schema.number([
      rules.exists({ table: "places", column: "id" }),
    ]),
  });
  public messages: CustomMessages = {};
}
