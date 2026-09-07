import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'departments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('department_id')   // 👈 auto-increment primary key
      table.string('department_name', 255).notNullable().unique()
      table
        .bigInteger('department_head_id')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('description').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}