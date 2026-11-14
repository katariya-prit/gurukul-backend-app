import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'item_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('item_id')
        .notNullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('CASCADE')
      table
        .string('role_code', 100)
        .nullable()
        .references('role_code')
        .inTable('roles')
        .onDelete('CASCADE')
      table
        .integer('section_id')
        .nullable()
        .references('section_id')
        .inTable('sections')
        .onDelete('CASCADE')
      table
        .bigInteger('user_suid')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.raw(`
      ALTER TABLE item_permissions
      ADD CONSTRAINT item_permissions_scope_check
      CHECK ((role_code IS NOT NULL) OR (section_id IS NOT NULL) OR (user_suid IS NOT NULL));
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
