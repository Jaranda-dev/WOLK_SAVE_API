import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateEvidenceValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    // now evidences belong to incidents per migration
    fileType: schema.string({}, [rules.minLength(1), rules.maxLength(50)]),
    path: schema.string({}, [rules.minLength(3), rules.maxLength(255)]),
    incidentId: schema.number([
      rules.exists({ table: 'incidents', column: 'id' }), // verificar que el incident exista
    ]),
  });

  public messages: CustomMessages = {};
}
