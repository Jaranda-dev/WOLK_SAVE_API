import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateIncidentValidator {
  constructor(protected ctx: HttpContextContract) {}

 public schema = schema.create({
    date: schema.date({}),
    routeRunId: schema.number([
      rules.exists({ table: "route_runs", column: "id" }),
    ]),
    description: schema.string.optional(),
    lat:schema.number(),
    lng:schema.number()
    
    
  });
  public messages: CustomMessages = {};
}
