import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "incidents";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.dateTime("date").notNullable()
      // Tipo/severidad del incidente
      table.enum('type', ['sin_riesgo', 'molestias', 'peligroso', 'muy_peligroso']).defaultTo('sin_riesgo')
      // Estado del incidente: en revisión o revisado
      table.enum('status', ['revision', 'revisado']).defaultTo('revision')
      table.text('description').nullable()
      table
        .bigInteger("type_incident_id")
        .unsigned()
        .references("incident_types.id")
        .onDelete("CASCADE");
      table
        .bigInteger("place_id")
        .unsigned()
        .references("places.id")
        .onDelete("CASCADE");
      table
        .bigInteger("route_run_id")
        .unsigned()
        .references("route_runs.id")
        .onDelete("CASCADE"); 
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('deleted_at').nullable()
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
