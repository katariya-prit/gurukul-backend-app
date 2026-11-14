import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'functionalities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('key', 100).notNullable().unique()
      table.string('name', 150).notNullable()
      table.text('description').nullable()
      table.string('icon', 50).nullable()
      table.string('theme_color', 20).nullable()
      table.string('evaluator_type', 20).notNullable().defaultTo('teacher')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.raw(`
      ALTER TABLE functionalities
      ADD CONSTRAINT functionalities_evaluator_type_check
      CHECK (evaluator_type IN ('ai', 'teacher', 'both'));
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
