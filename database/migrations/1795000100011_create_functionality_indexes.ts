import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_functionalities_is_active ON functionalities(is_active);
      CREATE INDEX IF NOT EXISTS idx_dept_func_dept_id ON department_functionalities(department_id);
      CREATE INDEX IF NOT EXISTS idx_dept_func_func_id ON department_functionalities(functionality_id);
      CREATE INDEX IF NOT EXISTS idx_dept_func_is_enabled ON department_functionalities(is_enabled);
      CREATE INDEX IF NOT EXISTS idx_func_items_func_id ON functionality_items(functionality_id);
      CREATE INDEX IF NOT EXISTS idx_func_items_dept_id ON functionality_items(department_id);
      CREATE INDEX IF NOT EXISTS idx_func_items_is_active ON functionality_items(is_active);
      CREATE INDEX IF NOT EXISTS idx_item_rubrics_item_id ON item_rubrics(item_id);
      CREATE INDEX IF NOT EXISTS idx_item_rubrics_created_by ON item_rubrics(created_by);
      CREATE INDEX IF NOT EXISTS idx_item_rubrics_is_current ON item_rubrics(is_current);
      CREATE INDEX IF NOT EXISTS idx_item_levels_item_id ON item_levels(item_id);
      CREATE INDEX IF NOT EXISTS idx_item_permissions_item_id ON item_permissions(item_id);
      CREATE INDEX IF NOT EXISTS idx_item_permissions_role_code ON item_permissions(role_code);
      CREATE INDEX IF NOT EXISTS idx_item_permissions_section_id ON item_permissions(section_id);
      CREATE INDEX IF NOT EXISTS idx_item_permissions_user_suid ON item_permissions(user_suid);
      CREATE INDEX IF NOT EXISTS idx_student_items_student_suid ON student_items(student_suid);
      CREATE INDEX IF NOT EXISTS idx_student_items_item_id ON student_items(item_id);
      CREATE INDEX IF NOT EXISTS idx_student_items_assigned_by ON student_items(assigned_by);
      CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_func_id ON dashboard_widgets(functionality_id);
      CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_item_id ON dashboard_widgets(item_id);
      CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_is_active ON dashboard_widgets(is_active);
      CREATE INDEX IF NOT EXISTS idx_lessons_functionality_id ON lessons(functionality_id);
      CREATE INDEX IF NOT EXISTS idx_lessons_item_id ON lessons(item_id);
      CREATE INDEX IF NOT EXISTS idx_lesson_submissions_item_id ON lesson_submissions(item_id);
    `)
  }

  async down() {
    this.schema.raw(`
      DROP INDEX IF EXISTS idx_functionalities_is_active;
      DROP INDEX IF EXISTS idx_dept_func_dept_id;
      DROP INDEX IF EXISTS idx_dept_func_func_id;
      DROP INDEX IF EXISTS idx_dept_func_is_enabled;
      DROP INDEX IF EXISTS idx_func_items_func_id;
      DROP INDEX IF EXISTS idx_func_items_dept_id;
      DROP INDEX IF EXISTS idx_func_items_is_active;
      DROP INDEX IF EXISTS idx_item_rubrics_item_id;
      DROP INDEX IF EXISTS idx_item_rubrics_created_by;
      DROP INDEX IF EXISTS idx_item_rubrics_is_current;
      DROP INDEX IF EXISTS idx_item_levels_item_id;
      DROP INDEX IF EXISTS idx_item_permissions_item_id;
      DROP INDEX IF EXISTS idx_item_permissions_role_code;
      DROP INDEX IF EXISTS idx_item_permissions_section_id;
      DROP INDEX IF EXISTS idx_item_permissions_user_suid;
      DROP INDEX IF EXISTS idx_student_items_student_suid;
      DROP INDEX IF EXISTS idx_student_items_item_id;
      DROP INDEX IF EXISTS idx_student_items_assigned_by;
      DROP INDEX IF EXISTS idx_dashboard_widgets_func_id;
      DROP INDEX IF EXISTS idx_dashboard_widgets_item_id;
      DROP INDEX IF EXISTS idx_dashboard_widgets_is_active;
      DROP INDEX IF EXISTS idx_lessons_functionality_id;
      DROP INDEX IF EXISTS idx_lessons_item_id;
      DROP INDEX IF EXISTS idx_lesson_submissions_item_id;
    `)
  }
}
