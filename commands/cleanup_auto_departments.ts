import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { functionalityCache } from '#services/functionality_cache_service'

export default class CleanupAutoDepartments extends BaseCommand {
  static commandName = 'cleanup:auto-departments'
  static description = 'Cleans up automatically created departments (Dancing, Computer and Technology, Accounting)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Perform actual deletion', default: false })
  declare force: boolean

  private targetNames = ['Dancing', 'Computer and Technology', 'Accounting']

  async run() {
    this.logger.info(`Starting auto-created departments cleanup (force=${this.force})...`)

    let totalCleaned = 0
    let hadError = false
    let foundAny = false

    for (const targetName of this.targetNames) {
      const deptRes = await db.rawQuery<{
        rows: Array<{
          department_id: number
          department_name: string
          description: string | null
        }>
      }>(
        `
          SELECT department_id, department_name, description
          FROM departments
          WHERE lower(trim(department_name)) = lower(trim(:targetName))
          LIMIT 1
        `,
        { targetName }
      )

      if (deptRes.rows.length === 0) {
        this.logger.info(`Target "${targetName}": not found in database (already clean).`)
        continue
      }

      foundAny = true
      const dept = deptRes.rows[0]
      const deptId = Number(dept.department_id)
      const expectedDescription = `${dept.department_name} Department`

      if (dept.description !== expectedDescription) {
        this.logger.warning(
          `Skipping "${dept.department_name}" (ID ${deptId}): description "${dept.description ?? 'null'}" does not match default "${expectedDescription}" (may have been edited by a human).`
        )
        continue
      }

      const sectionsCount = await this.getCount(
        'SELECT count(*)::int as count FROM sections WHERE department_id = :deptId',
        { deptId }
      )
      const usersCount = await this.getCount(
        'SELECT count(*)::int as count FROM users WHERE department_id = :deptId',
        { deptId }
      )
      const lessonsCount = await this.getCount(
        'SELECT count(*)::int as count FROM lessons WHERE department_id = :deptId OR assign_department_id = :deptId',
        { deptId }
      )
      const tasksCount = await this.getCount(
        'SELECT count(*)::int as count FROM tasks WHERE department_id = :deptId',
        { deptId }
      )
      const studentItemsCount = await this.getCount(
        `
          SELECT count(*)::int as count
          FROM student_items
          WHERE item_id IN (
            SELECT id FROM functionality_items WHERE department_id = :deptId
          )
        `,
        { deptId }
      )
      const studentProgressCount = await this.getCount(
        `
          SELECT count(*)::int as count
          FROM student_item_progress
          WHERE item_id IN (
            SELECT id FROM functionality_items WHERE department_id = :deptId
          )
        `,
        { deptId }
      )
      const submissionsCount = await this.getCount(
        `
          SELECT count(*)::int as count
          FROM lesson_submissions
          WHERE item_id IN (
            SELECT id FROM functionality_items WHERE department_id = :deptId
          )
        `,
        { deptId }
      )

      const hasRealData =
        sectionsCount > 0 ||
        usersCount > 0 ||
        lessonsCount > 0 ||
        tasksCount > 0 ||
        studentItemsCount > 0 ||
        studentProgressCount > 0 ||
        submissionsCount > 0

      if (hasRealData) {
        this.logger.error(
          `Refusing to delete "${dept.department_name}" (ID ${deptId}): department has real references ` +
            `(sections: ${sectionsCount}, users: ${usersCount}, lessons: ${lessonsCount}, tasks: ${tasksCount}, ` +
            `student_items: ${studentItemsCount}, student_progress: ${studentProgressCount}, submissions: ${submissionsCount}).`
        )
        hadError = true
        this.exitCode = 1
        continue
      }

      const itemsRes = await db.rawQuery<{ rows: Array<{ id: number; name: string }> }>(
        'SELECT id, name FROM functionality_items WHERE department_id = :deptId',
        { deptId }
      )
      const itemIds = itemsRes.rows.map((r) => Number(r.id))

      let rubricsCount = 0
      let levelsCount = 0
      let permissionsCount = 0
      let widgetsCount = 0

      if (itemIds.length > 0) {
        rubricsCount = await this.getCount(
          'SELECT count(*)::int as count FROM item_rubrics WHERE item_id = ANY(:itemIds)',
          { itemIds }
        )
        levelsCount = await this.getCount(
          'SELECT count(*)::int as count FROM item_levels WHERE item_id = ANY(:itemIds)',
          { itemIds }
        )
        permissionsCount = await this.getCount(
          'SELECT count(*)::int as count FROM item_permissions WHERE item_id = ANY(:itemIds)',
          { itemIds }
        )
        widgetsCount = await this.getCount(
          'SELECT count(*)::int as count FROM dashboard_widgets WHERE item_id = ANY(:itemIds)',
          { itemIds }
        )
      }

      const deptFuncCount = await this.getCount(
        'SELECT count(*)::int as count FROM department_functionalities WHERE department_id = :deptId',
        { deptId }
      )

      this.logger.info(`Department "${dept.department_name}" (ID: ${deptId}):`)
      this.logger.info(`  - department_functionalities: ${deptFuncCount}`)
      this.logger.info(`  - functionality_items: ${itemIds.length} (${itemsRes.rows.map((r) => r.name).join(', ')})`)
      this.logger.info(`  - item_rubrics: ${rubricsCount}`)
      this.logger.info(`  - item_levels: ${levelsCount}`)
      this.logger.info(`  - item_permissions: ${permissionsCount}`)
      this.logger.info(`  - dashboard_widgets: ${widgetsCount}`)
      this.logger.info(`  - department row: 1`)

      if (!this.force) {
        this.logger.info(`  -> [DRY-RUN] No changes made. Run with --force to delete.`)
        continue
      }

      await db.transaction(async (trx) => {
        if (itemIds.length > 0) {
          await trx.rawQuery('DELETE FROM dashboard_widgets WHERE item_id = ANY(:itemIds)', { itemIds })
          await trx.rawQuery('DELETE FROM item_permissions WHERE item_id = ANY(:itemIds)', { itemIds })
          await trx.rawQuery('DELETE FROM item_rubrics WHERE item_id = ANY(:itemIds)', { itemIds })
          await trx.rawQuery('DELETE FROM item_levels WHERE item_id = ANY(:itemIds)', { itemIds })
          await trx.rawQuery('DELETE FROM functionality_items WHERE id = ANY(:itemIds)', { itemIds })
        }
        await trx.rawQuery('DELETE FROM department_functionalities WHERE department_id = :deptId', { deptId })
        await trx.rawQuery('DELETE FROM departments WHERE department_id = :deptId', { deptId })
      })

      this.logger.success(`  -> Successfully deleted "${dept.department_name}" (ID ${deptId}) and its seeded rows.`)
      totalCleaned += 1
    }

    if (totalCleaned > 0) {
      functionalityCache.invalidate()
    }

    if (!foundAny) {
      this.logger.info('Nothing to clean. All target departments are absent.')
    } else if (this.force && !hadError) {
      this.logger.success(`Cleanup complete. Deleted ${totalCleaned} department(s).`)
    } else if (!this.force) {
      this.logger.info('Dry-run complete. Run with --force to apply deletion.')
    }
  }

  private async getCount(query: string, bindings: Record<string, unknown>): Promise<number> {
    const res = await db.rawQuery<{ rows: Array<{ count: number }> }>(query, bindings)
    return Number(res.rows[0]?.count ?? 0)
  }
}
