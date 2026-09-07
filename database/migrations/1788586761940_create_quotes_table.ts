import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quotes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('type', 20).notNullable()
      table.text('image_url').notNullable()
      table.string('public_id', 255).notNullable()
      table.text('title').notNullable().defaultTo('')
      table.text('description').nullable()
      table.date('event_date').notNullable()
      table.timestamp('created_at').defaultTo(this.now())
      table.text('name').notNullable().defaultTo('')
      table.date('display_start_date').nullable()
      table.date('display_end_date').nullable()
      table.date('event_start_date').nullable()
      table.date('event_end_date').nullable()
      table.string('is_approved', 20).defaultTo('Pending')
      table.string('status', 20).defaultTo('Active')
      table.string('add_to_hero', 3).defaultTo('No')
    })

    this.schema.raw(`
      ALTER TABLE quotes ADD CONSTRAINT quotes_type_check
        CHECK (type IN ('activity', 'event'));
      ALTER TABLE quotes ADD CONSTRAINT quotes_is_approved_check
        CHECK (is_approved IN ('Approved', 'Rejected', 'Pending'));
      ALTER TABLE quotes ADD CONSTRAINT quotes_status_check
        CHECK (status IN ('Active', 'Inactive'));
      ALTER TABLE quotes ADD CONSTRAINT quotes_add_to_hero_check
        CHECK (add_to_hero IN ('Yes', 'No'));

      CREATE INDEX idx_quotes_type ON quotes(type);
      CREATE INDEX idx_quotes_date ON quotes(event_date);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}