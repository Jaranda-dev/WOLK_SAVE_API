import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateIncidentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    date: schema.date({}),
    placeId: schema.number([rules.exists({ table: "places", column: "id" })]),
    routeRunId: schema.number([
      rules.exists({ table: "route_runs", column: "id" }),
    ]),
  });
  public messages: CustomMessages = {};
}
