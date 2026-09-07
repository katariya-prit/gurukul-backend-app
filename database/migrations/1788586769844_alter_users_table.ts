import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // users table is created before roles/departments/sections exist,
    // so these FK constraints must be added afterwards.
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('role_code').references('role_code').inTable('roles').onDelete('SET NULL')
      table
        .foreign('department_id')
        .references('department_id')
        .inTable('departments')
        .onDelete('SET NULL')
      table.foreign('section_id').references('section_id').inTable('sections').onDelete('SET NULL')
    })

    this.schema.raw(`
      CREATE INDEX idx_users_role_code ON users(role_code);
      CREATE INDEX idx_users_status ON users(status);
    `)
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('role_code')
      table.dropForeign('department_id')
      table.dropForeign('section_id')
    })
  }
}