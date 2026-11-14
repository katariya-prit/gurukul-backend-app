import db from '@adonisjs/lucid/services/db'
import FunctionalityItem from '#models/functionality_item'
import User from '#models/user'
import ItemPermission from '#models/item_permission'
import { ValidationError } from '#services/item_service'

export interface EnrollmentStudentDto {
  suid: number
  name: string
  departmentId: number
  sectionId: number | null
  sectionName: string | null
  enrolled: boolean
}

export interface StudentEnrollmentDetailDto {
  studentSuid: number
  name: string
  sectionName: string | null
  currentLevelNo: number
  currentLevelName: string
  totalPoints: number
  startedAt: string | null
}

export class ForbiddenError extends Error {
  status = 403
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export default class EnrollmentService {
  async verifyScope(user: User, itemId: number): Promise<FunctionalityItem> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    if (user.roleCode === 'SUPER_ADMIN') {
      return item
    }

    if (user.roleCode === 'HEAD100') {
      if (user.departmentId !== item.departmentId) {
        throw new ForbiddenError('You can only manage enrollments for items in your department.')
      }
      return item
    }

    if (user.roleCode === 'SECHEAD101') {
      if (!user.sectionId) {
        throw new ForbiddenError('You do not have an assigned section.')
      }

      const permitted = await ItemPermission.query()
        .where('item_id', itemId)
        .where((q) => {
          q.where('section_id', user.sectionId!).orWhere('role_code', 'SECHEAD101')
        })
        .first()

      if (!permitted) {
        throw new ForbiddenError('Your section does not have permission for this item.')
      }

      return item
    }

    throw new ForbiddenError('You are not authorized to manage enrollments.')
  }

  async getEnrollment(user: User, itemId: number): Promise<EnrollmentStudentDto[]> {
    const item = await this.verifyScope(user, itemId)

    let sql = `
      SELECT
        u.suid,
        u.name,
        u.department_id AS "departmentId",
        u.section_id AS "sectionId",
        s.name AS "sectionName",
        CASE WHEN si.id IS NOT NULL THEN true ELSE false END AS "enrolled"
      FROM users u
      LEFT JOIN sections s ON s.section_id = u.section_id
      LEFT JOIN student_items si ON si.student_suid = u.suid AND si.item_id = :itemId
      WHERE u.role_code = 'STUDENT'
        AND u.status = 'APPROVED'
        AND u.department_id = :departmentId
    `

    const bindings: Record<string, unknown> = {
      itemId,
      departmentId: item.departmentId,
    }

    if (user.roleCode === 'SECHEAD101' && user.sectionId) {
      sql += ' AND u.section_id = :sectionId'
      bindings.sectionId = user.sectionId
    }

    sql += ' ORDER BY u.name ASC'

    const result = await db.rawQuery(sql, bindings)
    return result.rows.map((r: Record<string, unknown>) => ({
      suid: Number(r.suid),
      name: String(r.name),
      departmentId: Number(r.departmentId),
      sectionId: r.sectionId !== null ? Number(r.sectionId) : null,
      sectionName: r.sectionName ? String(r.sectionName) : null,
      enrolled: Boolean(r.enrolled),
    }))
  }

  async updateEnrollment(
    user: User,
    itemId: number,
    studentSuids: number[],
    enrolled: boolean
  ): Promise<EnrollmentStudentDto[]> {
    const item = await this.verifyScope(user, itemId)
    const validStudents = await User.query()
      .whereIn('suid', studentSuids)
      .where('role_code', 'STUDENT')
      .where('department_id', item.departmentId)

    const validSuids = validStudents.map((s) => Number(s.suid))

    if (validSuids.length > 0) {
      await db.transaction(async (trx) => {
        if (enrolled) {
          for (const suid of validSuids) {
            await trx.rawQuery(
              `
                INSERT INTO student_items (student_suid, item_id, current_level_no, total_points, assigned_by, started_at)
                VALUES (:suid, :itemId, 1, 0, :assignedBy, NOW())
                ON CONFLICT (student_suid, item_id) DO NOTHING
              `,
              {
                suid,
                itemId,
                assignedBy: Number(user.suid),
              }
            )
          }
        } else {
          await trx.rawQuery(
            'DELETE FROM student_items WHERE item_id = :itemId AND student_suid = ANY(:validSuids)',
            { itemId, validSuids }
          )
        }
      })
    }

    return this.getEnrollment(user, itemId)
  }

  async getEnrollments(user: User, itemId: number): Promise<StudentEnrollmentDetailDto[]> {
    await this.verifyScope(user, itemId)

    const result = await db.rawQuery(
      `
        SELECT
          si.student_suid AS "studentSuid",
          u.name,
          s.name AS "sectionName",
          si.current_level_no AS "currentLevelNo",
          COALESCE(il.name, 'Level ' || si.current_level_no) AS "currentLevelName",
          si.total_points AS "totalPoints",
          si.started_at AS "startedAt"
        FROM student_items si
        INNER JOIN users u ON u.suid = si.student_suid
        LEFT JOIN sections s ON s.section_id = u.section_id
        LEFT JOIN item_levels il ON il.item_id = si.item_id AND il.level_no = si.current_level_no
        WHERE si.item_id = :itemId
        ORDER BY u.name ASC
      `,
      { itemId }
    )

    return result.rows.map((r: Record<string, unknown>) => ({
      studentSuid: Number(r.studentSuid),
      name: String(r.name),
      sectionName: r.sectionName ? String(r.sectionName) : null,
      currentLevelNo: Number(r.currentLevelNo),
      currentLevelName: String(r.currentLevelName),
      totalPoints: Number(r.totalPoints || 0),
      startedAt: r.startedAt ? new Date(String(r.startedAt)).toISOString() : null,
    }))
  }

  async getEligibleStudents(
    user: User,
    itemId: number,
    search?: string,
    sectionId?: number
  ): Promise<Array<{ suid: number; name: string; sectionId: number | null; sectionName: string | null }>> {
    const item = await this.verifyScope(user, itemId)

    let sql = `
      SELECT
        u.suid,
        u.name,
        u.section_id AS "sectionId",
        s.name AS "sectionName"
      FROM users u
      LEFT JOIN sections s ON s.section_id = u.section_id
      WHERE u.role_code = 'STUDENT'
        AND u.status = 'APPROVED'
        AND u.department_id = :departmentId
    `

    const bindings: Record<string, unknown> = {
      departmentId: item.departmentId,
    }

    if (search?.trim()) {
      sql += ' AND u.name ILIKE :search'
      bindings.search = `%${search.trim()}%`
    }

    if (sectionId) {
      sql += ' AND u.section_id = :sectionId'
      bindings.sectionId = sectionId
    } else if (user.roleCode === 'SECHEAD101' && user.sectionId) {
      sql += ' AND u.section_id = :sectionId'
      bindings.sectionId = user.sectionId
    }

    sql += ' ORDER BY u.name ASC'

    const result = await db.rawQuery(sql, bindings)
    return result.rows.map((r: Record<string, unknown>) => ({
      suid: Number(r.suid),
      name: String(r.name),
      sectionId: r.sectionId !== null ? Number(r.sectionId) : null,
      sectionName: r.sectionName ? String(r.sectionName) : null,
    }))
  }

  async enrollStudents(
    user: User,
    itemId: number,
    studentSuids: number[]
  ): Promise<{ enrolled: number; skipped: number }> {
    const item = await this.verifyScope(user, itemId)

    const existingRows = await db.rawQuery(
      'SELECT student_suid FROM student_items WHERE item_id = :itemId AND student_suid = ANY(:studentSuids)',
      { itemId, studentSuids }
    )
    const existingSet = new Set(existingRows.rows.map((r: Record<string, unknown>) => Number(r.student_suid)))

    const toEnroll = studentSuids.filter((suid) => !existingSet.has(suid))

    if (toEnroll.length > 0) {
      const validStudents = await User.query()
        .whereIn('suid', toEnroll)
        .where('role_code', 'STUDENT')
        .where('department_id', item.departmentId)

      const validSuids = validStudents.map((s) => Number(s.suid))

      await db.transaction(async (trx) => {
        for (const suid of validSuids) {
          await trx.rawQuery(
            `
              INSERT INTO student_items (student_suid, item_id, current_level_no, total_points, assigned_by, started_at)
              VALUES (:suid, :itemId, 1, 0, :assignedBy, NOW())
              ON CONFLICT (student_suid, item_id) DO NOTHING
            `,
            {
              suid,
              itemId,
              assignedBy: Number(user.suid),
            }
          )
        }
      })

      return {
        enrolled: validSuids.length,
        skipped: studentSuids.length - validSuids.length,
      }
    }

    return {
      enrolled: 0,
      skipped: studentSuids.length,
    }
  }

  async deleteEnrollment(user: User, itemId: number, studentSuid: number): Promise<boolean> {
    await this.verifyScope(user, itemId)

    const result = await db.rawQuery(
      'DELETE FROM student_items WHERE item_id = :itemId AND student_suid = :studentSuid',
      { itemId, studentSuid }
    )

    return (result.rowCount ?? 0) > 0
  }
}
