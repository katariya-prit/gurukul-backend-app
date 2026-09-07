import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'groups'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('group_id').primary()
      table.string('group_name', 255).notNullable()
      table.text('description').nullable()
      // Postgres native array type — matches BIGINT[] in original schema
      table.specificType('member_ids', 'BIGINT[]').notNullable()
      table.bigInteger('created_by').nullable().references('suid').inTable('users')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}