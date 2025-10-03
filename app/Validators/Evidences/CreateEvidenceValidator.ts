import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateEvidenceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    type: schema.enum(["photo", "audio"] as const),
    path: schema.string({}, [rules.minLength(3), rules.maxLength(255)]),
    reportId: schema.number([
      rules.exists({ table: "reports", column: "id" }), // verificar que el report exista
    ]),
  });

  public messages: CustomMessages = {};
}
