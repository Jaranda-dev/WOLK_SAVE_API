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
    lng:schema.number(),
    status:schema.enum.optional(['revision', 'revisado']),
    type:schema.enum.optional(['sin_riesgo', 'molestias', 'peligroso', 'muy_peligroso']),
    incidentTypeId:schema.number([
      rules.exists({ table: 'incident_types', column: 'id' })
    ]),
    ubicacion:schema.string()
  });
  public messages: CustomMessages = {};
}
