import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'evidences'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.string('file_name')
      table.string('file_type')
      table.integer('file_size').unsigned()
      table.string('path').notNullable()
      table.bigInteger('incident_id').unsigned().references('incidents.id').onDelete('CASCADE')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
