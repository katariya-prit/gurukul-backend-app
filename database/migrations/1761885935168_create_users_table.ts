import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.bigIncrements('suid').primary()
            table.string('avatar', 1000).nullable()
            table.string('name', 255).notNullable()
            table.string('username', 100).notNullable().unique()
            table.string('password', 255).notNullable()
            table.date('bod').nullable()
            table.integer('department_id').nullable()
            table.integer('section_id').nullable()
            table.integer('standard_id').nullable()
            table.string('role_code', 100).notNullable()
            table.date('joining_date').nullable()
            table
                .string('status', 20)
                .notNullable()
                .defaultTo('PENDING')
            table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
            table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}