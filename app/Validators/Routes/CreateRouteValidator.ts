import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateRouteValidator {
  constructor(protected ctx: HttpContextContract) {}

public schema = schema.create({
  userId: schema.number.optional([
    rules.exists({ table: 'users', column: 'id' })
  ]),
  name: schema.string(),
  origin: schema.string(),
  destination: schema.string(),
  originLatLng: schema.object().members({
    lat: schema.number(),
    lng: schema.number(),
  }),
  destinationLatLng: schema.object().members({
    lat: schema.number(),
    lng: schema.number(),
  }),
});
  public messages: CustomMessages = {};
}



