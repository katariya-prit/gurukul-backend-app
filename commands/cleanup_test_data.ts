import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'

export default class CleanupTestData extends BaseCommand {
  static commandName = 'cleanup:test-data'
  static description =
    'Safely cleans timestamp-pattern test departments and orphaned test functionalities'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Delete matching test data', default: false })
  declare force: boolean

  async run() {
    const departments = await db.rawQuery<{
      rows: Array<{
        department_id: number | string
        department_name: string
        created_at: string | Date
      }>
    }>(`
      SELECT department_id, department_name, created_at
      FROM departments
      WHERE department_name ~ '^(Test|Fresh|Sync|Idempotent|Disable|Dup|Unknown Func|Inactive Func|Enriched) Dept [0-9]{13}$'
      ORDER BY department_id
    `)

    let foundCandidates = departments.rows.length > 0
    let skippedUnsafeDepartment = false
    let deletedDepartments = 0

    for (const department of departments.rows) {
      const departmentId = Number(department.department_id)
      const itemRows = await db.rawQuery<{ rows: Array<{ id: number | string }> }>(
        'SELECT id FROM functionality_items WHERE department_id = :departmentId',
        { departmentId }
      )
      const itemIds = itemRows.rows.map((row) => Number(row.id))
      const itemIdsBinding = { itemIds }

      const counts = {
        department_functionalities: await this.getCount(
          'SELECT count(*)::int AS count FROM department_functionalities WHERE department_id = :departmentId',
          { departmentId }
        ),
        functionality_items: itemIds.length,
        sections: await this.getCount(
          'SELECT count(*)::int AS count FROM sections WHERE department_id = :departmentId',
          { departmentId }
        ),
        users: await this.getCount(
          'SELECT count(*)::int AS count FROM users WHERE department_id = :departmentId',
          { departmentId }
        ),
        department_heads: await this.getCount(
          `SELECT count(*)::int AS count FROM users u
           INNER JOIN departments d ON d.department_head_id = u.suid
           WHERE d.department_id = :departmentId`,
          { departmentId }
        ),
        lessons: await this.getCount(
          `SELECT count(*)::int AS count FROM lessons
           WHERE department_id = :departmentId
             OR assign_department_id = :departmentId
             OR item_id = ANY(:itemIds)`,
          { departmentId, ...itemIdsBinding }
        ),
        lesson_submissions: await this.getCount(
          `SELECT count(*)::int AS count FROM lesson_submissions
           WHERE lesson_id IN (
             SELECT lesson_id FROM lessons
             WHERE department_id = :departmentId OR assign_department_id = :departmentId
           ) OR item_id = ANY(:itemIds)`,
          { departmentId, ...itemIdsBinding }
        ),
        tasks: await this.getCount(
          'SELECT count(*)::int AS count FROM tasks WHERE department_id = :departmentId',
          { departmentId }
        ),
        groups: await this.getCount(
          `SELECT count(*)::int AS count FROM groups
           WHERE member_ids && ARRAY(
             SELECT suid FROM users WHERE department_id = :departmentId
           )::bigint[]`,
          { departmentId }
        ),
        student_items: await this.getItemCount(
          'SELECT count(*)::int AS count FROM student_items WHERE item_id = ANY(:itemIds)',
          itemIdsBinding
        ),
        student_item_progress: await this.getItemCount(
          'SELECT count(*)::int AS count FROM student_item_progress WHERE item_id = ANY(:itemIds)',
          itemIdsBinding
        ),
        item_rubrics: await this.getItemCount(
          'SELECT count(*)::int AS count FROM item_rubrics WHERE item_id = ANY(:itemIds)',
          itemIdsBinding
        ),
        item_levels: await this.getItemCount(
          'SELECT count(*)::int AS count FROM item_levels WHERE item_id = ANY(:itemIds)',
          itemIdsBinding
        ),
        item_permissions: await this.getItemCount(
          'SELECT count(*)::int AS count FROM item_permissions WHERE item_id = ANY(:itemIds)',
          itemIdsBinding
        ),
        dashboard_widgets: await this.getItemCount(
          'SELECT count(*)::int AS count FROM dashboard_widgets WHERE item_id = ANY(:itemIds)',
          itemIdsBinding
        ),
      }

      this.logger.info(
        `Department candidate id=${departmentId} name="${department.department_name}" created_at=${department.created_at}`
      )
      this.logger.info(`  Row counts: ${JSON.stringify(counts)}`)

      const unsafeCounts = {
        sections: counts.sections,
        users: counts.users,
        department_heads: counts.department_heads,
        lessons: counts.lessons,
        lesson_submissions: counts.lesson_submissions,
        tasks: counts.tasks,
        groups: counts.groups,
        student_items: counts.student_items,
        student_item_progress: counts.student_item_progress,
      }
      const unsafeReasons = Object.entries(unsafeCounts)
        .filter(([, count]) => count > 0)
        .map(([table, count]) => `${table}=${count}`)

      if (unsafeReasons.length > 0) {
        this.logger.error(
          `  SKIP: department has real data (${unsafeReasons.join(', ')}); no rows deleted for this department.`
        )
        skippedUnsafeDepartment = true
        continue
      }

      this.logger.info(
        `  Would delete: dashboard_widgets=${counts.dashboard_widgets}, item_permissions=${counts.item_permissions}, item_rubrics=${counts.item_rubrics}, item_levels=${counts.item_levels}, student_items=${counts.student_items}, student_item_progress=${counts.student_item_progress}, functionality_items=${counts.functionality_items}, department_functionalities=${counts.department_functionalities}, department=1`
      )

      if (!this.force) {
        this.logger.info('  [DRY-RUN] No changes made.')
        continue
      }

      await db.transaction(async (trx) => {
        if (itemIds.length > 0) {
          await trx.rawQuery(
            'DELETE FROM dashboard_widgets WHERE item_id = ANY(:itemIds)',
            itemIdsBinding
          )
          await trx.rawQuery(
            'DELETE FROM item_permissions WHERE item_id = ANY(:itemIds)',
            itemIdsBinding
          )
          await trx.rawQuery(
            'DELETE FROM item_rubrics WHERE item_id = ANY(:itemIds)',
            itemIdsBinding
          )
          await trx.rawQuery(
            'DELETE FROM item_levels WHERE item_id = ANY(:itemIds)',
            itemIdsBinding
          )
          await trx.rawQuery(
            'DELETE FROM student_items WHERE item_id = ANY(:itemIds)',
            itemIdsBinding
          )
          await trx.rawQuery(
            'DELETE FROM student_item_progress WHERE item_id = ANY(:itemIds)',
            itemIdsBinding
          )
          await trx.rawQuery(
            'DELETE FROM functionality_items WHERE id = ANY(:itemIds)',
            itemIdsBinding
          )
        }
        await trx.rawQuery(
          'DELETE FROM department_functionalities WHERE department_id = :departmentId',
          { departmentId }
        )
        await trx.rawQuery('DELETE FROM departments WHERE department_id = :departmentId', {
          departmentId,
        })
      })

      deletedDepartments += 1
      this.logger.success(`  Deleted department id=${departmentId}.`)
    }

    const functionalities = await db.rawQuery<{
      rows: Array<{
        id: number | string
        name: string
        key: string
        created_at: string | Date
      }>
    }>(`
      SELECT id, name, key, created_at
      FROM functionalities
      WHERE (
        key ~ '^(test_func|orphan_func|deactivate_func|inactive_func)_[0-9]{13}$'
        OR name ~ '^Inactive Func [0-9]{13}$'
      )
      AND name NOT IN (
        'Instrumental Marking',
        'Choreography Review',
        'Coding Assessment',
        'Accounting Practice'
      )
      AND key NOT IN (
        'instrumental_marking',
        'choreography_review',
        'coding_assessment',
        'accounting_practice'
      )
      ORDER BY id
    `)

    foundCandidates ||= functionalities.rows.length > 0
    let deletedFunctionalities = 0

    for (const functionality of functionalities.rows) {
      const functionalityId = Number(functionality.id)
      const references = {
        department_functionalities: await this.getCount(
          'SELECT count(*)::int AS count FROM department_functionalities WHERE functionality_id = :functionalityId',
          { functionalityId }
        ),
        functionality_items: await this.getCount(
          'SELECT count(*)::int AS count FROM functionality_items WHERE functionality_id = :functionalityId',
          { functionalityId }
        ),
        dashboard_widgets: await this.getCount(
          'SELECT count(*)::int AS count FROM dashboard_widgets WHERE functionality_id = :functionalityId',
          { functionalityId }
        ),
        lessons: await this.getCount(
          'SELECT count(*)::int AS count FROM lessons WHERE functionality_id = :functionalityId',
          { functionalityId }
        ),
      }

      this.logger.info(
        `Functionality candidate id=${functionalityId} name="${functionality.name}" key="${functionality.key}" created_at=${functionality.created_at}`
      )
      this.logger.info(`  Referencing row counts: ${JSON.stringify(references)}`)

      const hasReferences = Object.values(references).some((count) => count > 0)
      if (hasReferences) {
        this.logger.info('  SKIP: functionality is still referenced.')
        continue
      }

      this.logger.info(`  Would delete: functionality=1 (${functionality.name}).`)
      if (!this.force) {
        this.logger.info('  [DRY-RUN] No changes made.')
        continue
      }

      await db.from('functionalities').where('id', functionalityId).delete()
      deletedFunctionalities += 1
      this.logger.success(`  Deleted functionality id=${functionalityId}.`)
    }

    if (!foundCandidates) {
      this.logger.info('Nothing to clean.')
    } else if (!this.force) {
      this.logger.info('Dry-run complete. No changes were made.')
    } else {
      this.logger.success(
        `Cleanup complete. Deleted ${deletedDepartments} department(s) and ${deletedFunctionalities} functionality row(s).`
      )
    }

    if (skippedUnsafeDepartment) {
      this.exitCode = 1
    }
  }

  private async getCount(query: string, bindings: Record<string, unknown>): Promise<number> {
    const result = await db.rawQuery<{ rows: Array<{ count: number | string }> }>(query, bindings)
    return Number(result.rows[0]?.count ?? 0)
  }

  private async getItemCount(query: string, bindings: Record<string, unknown>): Promise<number> {
    if (Array.isArray(bindings.itemIds) && bindings.itemIds.length === 0) return 0
    return this.getCount(query, bindings)
  }
}
