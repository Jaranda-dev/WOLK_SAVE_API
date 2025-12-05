import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'routes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.string('name')
      table.bigInteger('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.bigInteger('start_place_id').unsigned().references('places.id').onDelete('CASCADE')
      table.bigInteger('end_place_id').unsigned().references('places.id').onDelete('CASCADE')
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
