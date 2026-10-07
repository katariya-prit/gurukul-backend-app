import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { progressIdParamValidator, progressSuidParamValidator } from '#validators/progress'

type GrowthTrendPoint = { date: string; newEnrollments: number; totalActive: number }
type UserProgressData = {
  suid: number
  name: string
  avatar: string | null
  totalTasks: number
  completedTasks: number
  percentage: number
}

function calcPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export default class ProgressController {
  private async getGrowthTrend(departmentId?: number, sectionId?: number): Promise<GrowthTrendPoint[]> {
    try {
      let query = `
          SELECT 
              DATE(u.joining_date)::text AS date,
              COUNT(u.suid) AS "newEnrollments",
              (SELECT COUNT(*) FROM users u2 WHERE u2.role_code = 'STUDENT' AND DATE(u2.joining_date) <= DATE(u.joining_date)`

      if (departmentId && !sectionId) query += ` AND u2.department_id = ?`
      if (sectionId) query += ` AND u2.section_id = ?`

      query += `)::int AS "totalActive"
          FROM users u
          WHERE u.role_code = 'STUDENT'
              AND u.joining_date >= NOW() - INTERVAL '30 days'
              AND u.joining_date <= NOW()`

      if (departmentId && !sectionId) query += ` AND u.department_id = ?`
      if (sectionId) query += ` AND u.section_id = ?`

      query += `
          GROUP BY DATE(u.joining_date)
          ORDER BY DATE(u.joining_date) ASC`

      const params: number[] = []
      if (departmentId && !sectionId) params.push(departmentId)
      if (sectionId) params.push(sectionId)

      const result = await db.rawQuery(query, params)
      return (result.rows as any[]).map((row) => ({
        date: row.date,
        newEnrollments: Number(row.newEnrollments),
        totalActive: Number(row.totalActive),
      }))
    } catch (error: any) {
      console.error('Growth trend fetch error:', error.message)
      return []
    }
  }

  private async computeUserProgress(suid: number): Promise<UserProgressData> {
    const userRes = await db.rawQuery(`SELECT suid, name, avatar FROM users WHERE suid = ?`, [suid])
    if (userRes.rows.length === 0) {
      throw new Error('User મળ્યો નથી.')
    }
    const user = userRes.rows[0]

    const taskRes = await db.rawQuery(
      `SELECT 
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
       FROM tasks WHERE assigned_to = ?`,
      [suid]
    )

    const total = Number(taskRes.rows[0].total)
    const completed = Number(taskRes.rows[0].completed)

    return {
      suid: user.suid,
      name: user.name,
      avatar: user.avatar,
      totalTasks: total,
      completedTasks: completed,
      percentage: calcPercentage(completed, total),
    }
  }

  async userProgress({ params, response }: HttpContext) {
    try {
      const { suid } = await progressSuidParamValidator.validate(params)
      const data = await this.computeUserProgress(suid)
      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.notFound({ success: false, message: error.message || 'User progress not found' })
    }
  }

  async sectionProgress({ params, response }: HttpContext) {
    try {
      const { id: sectionId } = await progressIdParamValidator.validate(params)

      const sectionRes = await db.rawQuery(
        `SELECT section_id, name, department_id FROM sections WHERE section_id = ?`,
        [sectionId]
      )
      if (sectionRes.rows.length === 0) {
        throw new Error('Section મળ્યું નથી.')
      }
      const section = sectionRes.rows[0]

      const usersRes = await db.rawQuery(
        `SELECT suid, name, avatar FROM users WHERE section_id = ? AND role_code = 'STUDENT' ORDER BY name ASC`,
        [sectionId]
      )

      const users: UserProgressData[] = []
      let sectionTotal = 0
      let sectionCompleted = 0

      for (const u of usersRes.rows as any[]) {
        const taskRes = await db.rawQuery(
          `SELECT 
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
           FROM tasks WHERE assigned_to = ?`,
          [u.suid]
        )
        const total = Number(taskRes.rows[0].total)
        const completed = Number(taskRes.rows[0].completed)

        sectionTotal += total
        sectionCompleted += completed

        users.push({
          suid: u.suid,
          name: u.name,
          avatar: u.avatar,
          totalTasks: total,
          completedTasks: completed,
          percentage: calcPercentage(completed, total),
        })
      }

      const studentCountRes = await db.rawQuery(
        `SELECT COUNT(*) AS student_count FROM users WHERE section_id = ? AND role_code = 'STUDENT'`,
        [sectionId]
      )
      const studentCount = Number(studentCountRes.rows[0]?.student_count || 0)

      const growthTrend = await this.getGrowthTrend(undefined, sectionId)

      const data = {
        section_id: section.section_id,
        name: section.name,
        department_id: section.department_id,
        totalTasks: sectionTotal,
        completedTasks: sectionCompleted,
        percentage: calcPercentage(sectionCompleted, sectionTotal),
        users,
        studentCount,
        growthTrend,
      }

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.notFound({ success: false, message: error.message || 'Section progress not found' })
    }
  }

  async departmentProgress({ params, response }: HttpContext) {
    try {
      const { id: departmentId } = await progressIdParamValidator.validate(params)

      const deptRes = await db.rawQuery(
        `SELECT department_id, department_name FROM departments WHERE department_id = ?`,
        [departmentId]
      )
      if (deptRes.rows.length === 0) {
        throw new Error('Department મળ્યો નથી.')
      }
      const dept = deptRes.rows[0]

      const sectionsRes = await db.rawQuery(
        `SELECT section_id FROM sections WHERE department_id = ? ORDER BY section_id ASC`,
        [departmentId]
      )

      const sections = []
      let deptTotal = 0
      let deptCompleted = 0

      for (const s of sectionsRes.rows as any[]) {
        const sectionRes = await db.rawQuery(
          `SELECT section_id, name, department_id FROM sections WHERE section_id = ?`,
          [s.section_id]
        )
        const section = sectionRes.rows[0]

        const usersRes = await db.rawQuery(
          `SELECT suid, name, avatar FROM users WHERE section_id = ? AND role_code = 'STUDENT' ORDER BY name ASC`,
          [s.section_id]
        )

        const users: UserProgressData[] = []
        let sectionTotal = 0
        let sectionCompleted = 0

        for (const u of usersRes.rows as any[]) {
          const taskRes = await db.rawQuery(
            `SELECT 
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
             FROM tasks WHERE assigned_to = ?`,
            [u.suid]
          )
          const total = Number(taskRes.rows[0].total)
          const completed = Number(taskRes.rows[0].completed)

          sectionTotal += total
          sectionCompleted += completed

          users.push({
            suid: u.suid,
            name: u.name,
            avatar: u.avatar,
            totalTasks: total,
            completedTasks: completed,
            percentage: calcPercentage(completed, total),
          })
        }

        const studentCountRes = await db.rawQuery(
          `SELECT COUNT(*) AS student_count FROM users WHERE section_id = ? AND role_code = 'STUDENT'`,
          [s.section_id]
        )
        const studentCount = Number(studentCountRes.rows[0]?.student_count || 0)

        const sectionGrowthTrend = await this.getGrowthTrend(undefined, s.section_id)

        deptTotal += sectionTotal
        deptCompleted += sectionCompleted

        sections.push({
          section_id: section.section_id,
          name: section.name,
          department_id: section.department_id,
          totalTasks: sectionTotal,
          completedTasks: sectionCompleted,
          percentage: calcPercentage(sectionCompleted, sectionTotal),
          users,
          studentCount,
          growthTrend: sectionGrowthTrend,
        })
      }

      const growthTrend = await this.getGrowthTrend(departmentId)

      const data = {
        department_id: dept.department_id,
        department_name: dept.department_name,
        totalTasks: deptTotal,
        completedTasks: deptCompleted,
        percentage: calcPercentage(deptCompleted, deptTotal),
        sections,
        growthTrend,
      }

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.notFound({ success: false, message: error.message || 'Department progress not found' })
    }
  }

  async allDepartments({ response }: HttpContext) {
    try {
      const result = await db.rawQuery(
        `SELECT 
            d.department_id,
            d.department_name,
            COUNT(t.task_id) AS total,
            COUNT(t.task_id) FILTER (WHERE t.status = 'COMPLETED') AS completed
         FROM departments d
         LEFT JOIN tasks t ON t.department_id = d.department_id
         GROUP BY d.department_id, d.department_name
         ORDER BY d.department_name ASC`
      )

      const data = (result.rows as any[]).map((row) => ({
        department_id: row.department_id,
        department_name: row.department_name,
        percentage: calcPercentage(Number(row.completed), Number(row.total)),
      }))

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Departments progress fetch કરવામાં એરર આવી.',
      })
    }
  }
}