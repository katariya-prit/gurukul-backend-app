import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_modules_modtime ON modules;
      CREATE TRIGGER update_modules_modtime BEFORE UPDATE ON modules
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      DROP TRIGGER IF EXISTS update_roles_modtime ON roles;
      CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      DROP TRIGGER IF EXISTS update_departments_modtime ON departments;
      CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON departments
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      DROP TRIGGER IF EXISTS update_sections_modtime ON sections;
      CREATE TRIGGER update_sections_modtime BEFORE UPDATE ON sections
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      DROP TRIGGER IF EXISTS update_users_modtime ON users;
      CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      DROP TRIGGER IF EXISTS update_lessons_modtime ON lessons;
      CREATE TRIGGER update_lessons_modtime BEFORE UPDATE ON lessons
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      DROP TRIGGER IF EXISTS update_daily_darshan_modtime ON daily_darshan;
      CREATE TRIGGER update_daily_darshan_modtime BEFORE UPDATE ON daily_darshan
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

      CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(department_name);
      CREATE INDEX IF NOT EXISTS idx_sections_name ON sections(name);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tasks_section ON tasks(section_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_id);
    `)
  }

  async down() {
    this.schema.raw(`
      DROP TRIGGER IF EXISTS update_modules_modtime ON modules;
      DROP TRIGGER IF EXISTS update_roles_modtime ON roles;
      DROP TRIGGER IF EXISTS update_departments_modtime ON departments;
      DROP TRIGGER IF EXISTS update_sections_modtime ON sections;
      DROP TRIGGER IF EXISTS update_users_modtime ON users;
      DROP TRIGGER IF EXISTS update_lessons_modtime ON lessons;
      DROP TRIGGER IF EXISTS update_daily_darshan_modtime ON daily_darshan;
      DROP FUNCTION IF EXISTS update_modified_column();
    `)
  }
}