import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type User from '#models/user'
import { progressIdParamValidator, progressSuidParamValidator } from '#validators/progress'
import { lessonGrowthQueryValidator } from '#validators/lesson_progress'
import LessonProgressService, {
  emptyLessonStats,
  mergeLessonStats,
  type LessonStats,
  type StudentLessonItem,
} from '#services/lesson_progress_service'

type GrowthTrendPoint = { date: string; newEnrollments: number; totalActive: number }

type StudentRow = { suid: number; name: string; avatar: string | null }
type SectionRow = { section_id: number; name: string; department_id: number }

type UserProgressData = {
  suid: number
  name: string
  avatar: string | null
  totalTasks: number
  completedTasks: number
  percentage: number
  overallPercentage: number
} & LessonStats

type SectionProgressData = {
  section_id: number
  name: string
  department_id: number
  totalTasks: number
  completedTasks: number
  percentage: number
  overallPercentage: number
  users: UserProgressData[]
  studentCount: number
  growthTrend: GrowthTrendPoint[]
} & LessonStats

function calcPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

function overall(completedTasks: number, totalTasks: number, lesson: LessonStats): number {
  return calcPercentage(
    completedTasks + lesson.submittedLessons,
    totalTasks + lesson.totalLessons
  )
}

export default class ProgressController {
  private lessons = new LessonProgressService()

  private async getGrowthTrend(
    departmentId?: number,
    sectionId?: number
  ): Promise<GrowthTrendPoint[]> {
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
      if (departmentId && !sectionId) params.push(departmentId, departmentId)
      if (sectionId) params.push(sectionId, sectionId)

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

  private async countTasks(suid: number): Promise<{ total: number; completed: number }> {
    const taskRes = await db.rawQuery(
      `SELECT 
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
       FROM tasks WHERE assigned_to = ?`,
      [suid]
    )
    return {
      total: Number(taskRes.rows[0].total),
      completed: Number(taskRes.rows[0].completed),
    }
  }

  private async computeUserProgress(
    suid: number
  ): Promise<UserProgressData & { lessons: StudentLessonItem[] }> {
    const userRes = await db.rawQuery(`SELECT suid, name, avatar FROM users WHERE suid = ?`, [suid])
    if (userRes.rows.length === 0) {
      throw new Error('User મળ્યો નથી.')
    }
    const user = userRes.rows[0]

    const { total, completed } = await this.countTasks(suid)
    const detail = await this.lessons.studentDetail(suid)

    return {
      suid: user.suid,
      name: user.name,
      avatar: user.avatar,
      totalTasks: total,
      completedTasks: completed,
      percentage: calcPercentage(completed, total),
      overallPercentage: overall(completed, total, detail.stats),
      ...detail.stats,
      lessons: detail.items,
    }
  }

  private async fetchSectionStudents(sectionId: number): Promise<StudentRow[]> {
    const res = await db.rawQuery(
      `SELECT suid, name, avatar FROM users WHERE section_id = ? AND role_code = 'STUDENT' ORDER BY name ASC`,
      [sectionId]
    )
    return res.rows as StudentRow[]
  }

  private async buildSection(
    section: SectionRow,
    students: StudentRow[],
    lessonStats: Map<number, LessonStats>
  ): Promise<SectionProgressData> {
    const users: UserProgressData[] = []
    let sectionTotal = 0
    let sectionCompleted = 0

    for (const student of students) {
      const { total, completed } = await this.countTasks(student.suid)
      const lesson = lessonStats.get(Number(student.suid)) ?? emptyLessonStats()

      sectionTotal += total
      sectionCompleted += completed

      users.push({
        suid: student.suid,
        name: student.name,
        avatar: student.avatar,
        totalTasks: total,
        completedTasks: completed,
        percentage: calcPercentage(completed, total),
        overallPercentage: overall(completed, total, lesson),
        ...lesson,
      })
    }

    const lessonTotals = mergeLessonStats(users)
    const growthTrend = await this.getGrowthTrend(undefined, section.section_id)

    return {
      section_id: section.section_id,
      name: section.name,
      department_id: section.department_id,
      totalTasks: sectionTotal,
      completedTasks: sectionCompleted,
      percentage: calcPercentage(sectionCompleted, sectionTotal),
      overallPercentage: overall(sectionCompleted, sectionTotal, lessonTotals),
      ...lessonTotals,
      users,
      studentCount: students.length,
      growthTrend,
    }
  }

  private async canViewStudent(
    roleCode: string,
    suid: number,
    departmentId: number | null,
    sectionId: number | null,
    targetSuid: number
  ): Promise<boolean> {
    if (roleCode === 'SUPER_ADMIN') return true
    if (roleCode === 'STUDENT') return suid === targetSuid

    const target = await db
      .from('users')
      .where('suid', targetSuid)
      .where('role_code', 'STUDENT')
      .first()

    if (!target) return false
    if (roleCode === 'HEAD100') return Number(target.department_id) === departmentId
    if (roleCode === 'SECHEAD101') return Number(target.section_id) === sectionId
    return false
  }

  private canViewSection(user: User, section: SectionRow): boolean {
    return (
      user.roleCode === 'SUPER_ADMIN' ||
      (user.roleCode === 'HEAD100' &&
        Number(section.department_id) === Number(user.departmentId)) ||
      (user.roleCode === 'SECHEAD101' && Number(section.section_id) === Number(user.sectionId))
    )
  }

  private canViewDepartment(user: User, departmentId: number): boolean {
    return (
      user.roleCode === 'SUPER_ADMIN' ||
      (user.roleCode === 'HEAD100' && departmentId === Number(user.departmentId))
    )
  }

  async userProgress({ params, response, auth }: HttpContext) {
    try {
      const { suid } = await progressSuidParamValidator.validate(params)
      const currentUser = auth.getUserOrFail()
      const canView = await this.canViewStudent(
        currentUser.roleCode,
        Number(currentUser.suid),
        currentUser.departmentId ?? null,
        currentUser.sectionId ?? null,
        suid
      )
      if (!canView) {
        return response.forbidden({
          success: false,
          message: 'You cannot view progress for this user.',
        })
      }

      const data = await this.computeUserProgress(suid)
      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.notFound({
        success: false,
        message: error.message || 'User progress not found',
      })
    }
  }

  async sectionProgress({ params, response, auth }: HttpContext) {
    try {
      const { id: sectionId } = await progressIdParamValidator.validate(params)

      const sectionRes = await db.rawQuery(
        `SELECT section_id, name, department_id FROM sections WHERE section_id = ?`,
        [sectionId]
      )
      if (sectionRes.rows.length === 0) {
        throw new Error('Section મળ્યું નથી.')
      }
      const section = sectionRes.rows[0] as SectionRow

      if (!this.canViewSection(auth.getUserOrFail(), section)) {
        return response.forbidden({
          success: false,
          message: 'You cannot view progress for this section.',
        })
      }

      const students = await this.fetchSectionStudents(sectionId)
      const lessonStats = await this.lessons.forStudents(students.map((s) => Number(s.suid)))
      const data = await this.buildSection(section, students, lessonStats)

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.notFound({
        success: false,
        message: error.message || 'Section progress not found',
      })
    }
  }

  async departmentProgress({ params, response, auth }: HttpContext) {
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

      if (!this.canViewDepartment(auth.getUserOrFail(), departmentId)) {
        return response.forbidden({
          success: false,
          message: 'You cannot view progress for this department.',
        })
      }

      const sectionsRes = await db.rawQuery(
        `SELECT section_id, name, department_id FROM sections WHERE department_id = ? ORDER BY section_id ASC`,
        [departmentId]
      )
      const sectionRows = sectionsRes.rows as SectionRow[]

      const studentsBySection = await Promise.all(
        sectionRows.map((s) => this.fetchSectionStudents(s.section_id))
      )
      const lessonStats = await this.lessons.forStudents(
        studentsBySection.flat().map((s) => Number(s.suid))
      )

      const sections: SectionProgressData[] = []
      for (let i = 0; i < sectionRows.length; i++) {
        sections.push(await this.buildSection(sectionRows[i], studentsBySection[i], lessonStats))
      }

      const deptTotal = sections.reduce((sum, s) => sum + s.totalTasks, 0)
      const deptCompleted = sections.reduce((sum, s) => sum + s.completedTasks, 0)
      const lessonTotals = mergeLessonStats(sections)
      const growthTrend = await this.getGrowthTrend(departmentId)

      const data = {
        department_id: dept.department_id,
        department_name: dept.department_name,
        totalTasks: deptTotal,
        completedTasks: deptCompleted,
        percentage: calcPercentage(deptCompleted, deptTotal),
        overallPercentage: overall(deptCompleted, deptTotal, lessonTotals),
        ...lessonTotals,
        sections,
        growthTrend,
      }

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.notFound({
        success: false,
        message: error.message || 'Department progress not found',
      })
    }
  }

  async allDepartments({ response, auth }: HttpContext) {
    if (auth.getUserOrFail().roleCode !== 'SUPER_ADMIN') {
      return response.forbidden({
        success: false,
        message: 'Only SUPER_ADMIN can view all departments progress.',
      })
    }

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

      const studentsRes = await db.rawQuery(
        `SELECT u.suid, s.department_id
         FROM users u
         JOIN sections s ON s.section_id = u.section_id
         WHERE u.role_code = 'STUDENT'`
      )
      const studentRows = studentsRes.rows as { suid: number | string; department_id: number }[]
      const lessonStats = await this.lessons.forStudents(studentRows.map((r) => Number(r.suid)))

      const lessonsByDepartment = new Map<number, LessonStats[]>()
      for (const row of studentRows) {
        const key = Number(row.department_id)
        const list = lessonsByDepartment.get(key) ?? []
        list.push(lessonStats.get(Number(row.suid)) ?? emptyLessonStats())
        lessonsByDepartment.set(key, list)
      }

      const data = (result.rows as any[]).map((row) => {
        const total = Number(row.total)
        const completed = Number(row.completed)
        const lesson = mergeLessonStats(lessonsByDepartment.get(Number(row.department_id)) ?? [])

        return {
          department_id: row.department_id,
          department_name: row.department_name,
          percentage: calcPercentage(completed, total),
          overallPercentage: overall(completed, total, lesson),
          ...lesson,
        }
      })

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Departments progress fetch કરવામાં એરર આવી.',
      })
    }
  }

  async lessonGrowth({ request, response, auth }: HttpContext) {
    try {
      const { scope, id, period } = await lessonGrowthQueryValidator.validate(request.qs())
      const currentUser = auth.getUserOrFail()
      let suids: number[] = []

      if (scope === 'all') {
        if (currentUser.roleCode !== 'SUPER_ADMIN') {
          return response.forbidden({
            success: false,
            message: 'Only SUPER_ADMIN can view overall lesson growth.',
          })
        }
        const res = await db.rawQuery(`SELECT suid FROM users WHERE role_code = 'STUDENT'`)
        suids = (res.rows as { suid: number | string }[]).map((r) => Number(r.suid))
      } else {
        if (!id) {
          return response.badRequest({ success: false, message: 'id is required for this scope.' })
        }

        if (scope === 'user') {
          const canView = await this.canViewStudent(
            currentUser.roleCode,
            Number(currentUser.suid),
            currentUser.departmentId ?? null,
            currentUser.sectionId ?? null,
            id
          )
          if (!canView) {
            return response.forbidden({
              success: false,
              message: 'You cannot view progress for this user.',
            })
          }
          suids = [id]
        } else if (scope === 'section') {
          const sectionRes = await db.rawQuery(
            `SELECT section_id, name, department_id FROM sections WHERE section_id = ?`,
            [id]
          )
          if (sectionRes.rows.length === 0) {
            return response.notFound({ success: false, message: 'Section મળ્યું નથી.' })
          }
          if (!this.canViewSection(currentUser, sectionRes.rows[0] as SectionRow)) {
            return response.forbidden({
              success: false,
              message: 'You cannot view progress for this section.',
            })
          }
          const students = await this.fetchSectionStudents(id)
          suids = students.map((s) => Number(s.suid))
        } else {
          if (!this.canViewDepartment(currentUser, id)) {
            return response.forbidden({
              success: false,
              message: 'You cannot view progress for this department.',
            })
          }
          const res = await db.rawQuery(
            `SELECT u.suid
             FROM users u
             JOIN sections s ON s.section_id = u.section_id
             WHERE s.department_id = ? AND u.role_code = 'STUDENT'`,
            [id]
          )
          suids = (res.rows as { suid: number | string }[]).map((r) => Number(r.suid))
        }
      }

      const data = await this.lessons.growth(suids, period ?? 'week')
      return response.ok({ success: true, data })
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity({
          success: false,
          message: 'Validation failed',
          errors: error.messages,
        })
      }
      return response.internalServerError({
        success: false,
        message: error.message || 'Lesson growth fetch કરવામાં એરર આવી.',
      })
    }
  }
}