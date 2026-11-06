import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { v2 as cloudinary } from 'cloudinary'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import Lesson from '#models/lesson'
import type User from '#models/user'
import { resolveLessonAudience } from '#services/lesson_audience_service'
import { createLessonNotifications } from '#services/notification_service'

cloudinary.config({
  cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: env.get('CLOUDINARY_API_KEY'),
  api_secret: env.get('CLOUDINARY_API_SECRET'),
  secure: true,
})

const LESSON_TYPES = ['video', 'audio', 'image', 'document']
const ASSIGN_SCOPES = ['all', 'department', 'section', 'student', 'group']

interface ResolvedAssignment {
  scope: string
  lessonDepartmentId: number | null
  assignDepartmentId: number | null
  assignSectionId: number | null
  assignStudentId: number | null
  assignGroupId: number | null
  assignHeadOnly: boolean
}

type ResolveResult = ResolvedAssignment | { status: 400 | 403; error: string }

const toNum = (value: unknown): number | null => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export default class LessonController {
  private toApi(l: Lesson) {
    return {
      lesson_id: l.lessonId,
      lesson_title: l.lessonTitle,
      lesson_type: l.lessonType,
      media_url: l.mediaUrl,
      media_public_id: l.mediaPublicId,
      description: l.description,
      department_id: l.departmentId,
      department_name: l.department?.departmentName ?? null,
      date_start: l.dateStart?.toISODate() ?? null,
      date_end: l.dateEnd?.toISODate() ?? null,
      progress_points: l.progressPoints,
      created_by: l.createdBy,
      created_by_name: l.creator?.name ?? null,
      role_code: l.roleCode,
      assign_scope: l.assignScope,
      assign_department_id: l.assignDepartmentId,
      assign_section_id: l.assignSectionId,
      assign_student_id: l.assignStudentId,
      assign_group_id: l.assignGroupId,
      assign_head_only: l.assignHeadOnly,
      created_at: l.createdAt?.toISO() ?? null,
    }
  }

  private async can(user: User, module: string, action: string): Promise<boolean> {
    await user.load('role')
    const perms = user.role?.permissions as Record<string, Record<string, boolean>> | undefined
    return Boolean(perms?.[module]?.[action])
  }

  /**
   * Kyo role kene lesson aapi shake e ahi decide thay chhe. Frontend ni vaat par bharoso nathi,
   * role ane id hammesha token wala user mathi j aave chhe.
   *
   * SUPER_ADMIN : all / department / section / student / group (koi pan)
   * HEAD100     : potana department ma j -> "all" = potanu aakhu department, section, student
   * SECHEAD101  : potana section ma j   -> "all" = potanu aakhu section, student
   * bija roles  : lesson aapi nathi shakta
   */
  private async resolveAssignment(
    user: User,
    a: any,
    requestedDepartmentId: unknown
  ): Promise<ResolveResult> {
    let scope: string = a?.scope ?? 'all'
    let assignDepartmentId = toNum(a?.departmentId ?? a?.department_id)
    let assignSectionId = toNum(a?.sectionId ?? a?.section_id)
    const assignStudentId = toNum(a?.studentId ?? a?.student_id)
    const assignGroupId = toNum(a?.groupId ?? a?.group_id)
    let assignHeadOnly = Boolean(a?.headOnly ?? a?.head_only ?? false)
    let lessonDepartmentId = toNum(requestedDepartmentId)

    if (!ASSIGN_SCOPES.includes(scope)) {
      return { status: 400, error: 'Assignment scope invalid chhe.' }
    }

    if (user.roleCode === 'SUPER_ADMIN') {
      // koi restriction nathi
    } else if (user.roleCode === 'HEAD100') {
      const myDepartmentId = toNum(user.departmentId)
      if (!myDepartmentId) {
        return { status: 403, error: 'Tamara account ma department set nathi.' }
      }
      lessonDepartmentId = myDepartmentId

      if (scope === 'group') {
        return { status: 403, error: 'Group wise lesson fakt Super Admin aapi shake.' }
      }

      if (scope === 'all' || scope === 'department') {
        scope = 'department'
        assignDepartmentId = myDepartmentId
        assignSectionId = null
      } else if (scope === 'section') {
        const section = assignSectionId
          ? await db.from('sections').where('section_id', assignSectionId).first()
          : null
        if (!section || Number(section.department_id) !== myDepartmentId) {
          return { status: 403, error: 'Aa section tamara department nu nathi.' }
        }
        assignDepartmentId = null
      } else if (scope === 'student') {
        const student = assignStudentId
          ? await db.from('users').where('suid', assignStudentId).first()
          : null
        if (
          !student ||
          student.role_code !== 'STUDENT' ||
          Number(student.department_id) !== myDepartmentId
        ) {
          return { status: 403, error: 'Aa student tamara department no nathi.' }
        }
        assignDepartmentId = null
        assignSectionId = null
      }
    } else if (user.roleCode === 'SECHEAD101') {
      const mySectionId = toNum(user.sectionId)
      if (!mySectionId) {
        return { status: 403, error: 'Tamara account ma section set nathi.' }
      }
      lessonDepartmentId = toNum(user.departmentId)

      if (scope === 'all' || scope === 'section') {
        scope = 'section'
        assignSectionId = mySectionId
        assignDepartmentId = null
        assignHeadOnly = false
      } else if (scope === 'student') {
        const student = assignStudentId
          ? await db.from('users').where('suid', assignStudentId).first()
          : null
        if (
          !student ||
          student.role_code !== 'STUDENT' ||
          Number(student.section_id) !== mySectionId
        ) {
          return { status: 403, error: 'Aa student tamara section no nathi.' }
        }
        assignDepartmentId = null
        assignSectionId = null
        assignHeadOnly = false
      } else {
        return { status: 403, error: 'Section Head fakt potana section ma lesson aapi shake.' }
      }
    } else {
      return { status: 403, error: 'Tamari role ne lesson aapvani permission nathi.' }
    }

    const required: Record<string, number | null> = {
      department: assignDepartmentId,
      section: assignSectionId,
      student: assignStudentId,
      group: assignGroupId,
    }
    if (scope in required && !required[scope]) {
      return { status: 400, error: `${scope} select karvu jaruri chhe.` }
    }

    if (scope !== 'department' && scope !== 'section') {
      assignHeadOnly = false
    }

    return {
      scope,
      lessonDepartmentId,
      assignDepartmentId: scope === 'department' ? assignDepartmentId : null,
      assignSectionId: scope === 'section' ? assignSectionId : null,
      assignStudentId: scope === 'student' ? assignStudentId : null,
      assignGroupId: scope === 'group' ? assignGroupId : null,
      assignHeadOnly,
    }
  }

  // POST /lessons/create  (multipart/form-data)
  public async store({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!(await this.can(user, 'Lesson', 'create'))) {
      return response
        .status(403)
        .json({ success: false, message: 'Tamne lesson create karvani permission nathi.' })
    }

    const body = request.body()
    const {
      lesson_title: lessonTitle,
      lesson_type: lessonType,
      department_id: departmentId,
      date_start: dateStart,
      date_end: dateEnd,
      description,
      progress_points: progressPoints,
      assignment,
    } = body

    if (!lessonTitle || !lessonType || !dateStart || !dateEnd) {
      return response.status(400).json({
        success: false,
        message: 'Title, type, start date ane end date jaruri chhe.',
      })
    }

    if (!LESSON_TYPES.includes(lessonType)) {
      return response.status(400).json({ success: false, message: 'Lesson type invalid chhe.' })
    }

    const start = DateTime.fromISO(String(dateStart))
    const end = DateTime.fromISO(String(dateEnd))
    if (!start.isValid || !end.isValid) {
      return response.status(400).json({ success: false, message: 'Date format invalid chhe.' })
    }
    if (end < start) {
      return response
        .status(400)
        .json({ success: false, message: 'End date start date pachi hovi joie.' })
    }

    let parsed: any
    try {
      parsed = typeof assignment === 'string' ? JSON.parse(assignment) : assignment
    } catch {
      return response.status(400).json({ success: false, message: 'Assignment data invalid chhe.' })
    }

    const rules = await this.resolveAssignment(user, parsed ?? {}, departmentId)
    if ('error' in rules) {
      return response.status(rules.status).json({ success: false, message: rules.error })
    }

    let mediaUrl: string | null = null
    let mediaPublicId: string | null = null
    const uploaded = Object.values(request.allFiles()).flat()[0]
    if (uploaded) {
      if (!uploaded.isValid) {
        return response.status(400).json({
          success: false,
          message: uploaded.errors[0]?.message || 'Invalid media file.',
        })
      }
      try {
        const result = await cloudinary.uploader.upload(uploaded.tmpPath!, {
          folder: 'gurukul/lessons',
          resource_type: 'auto',
        })
        mediaUrl = result.secure_url
        mediaPublicId = result.public_id
      } catch (error: any) {
        return response.status(500).json({
          success: false,
          message: error.message || 'Media upload karva ma error aavi.',
        })
      }
    }

    try {
      const lesson = await Lesson.create({
        lessonTitle: String(lessonTitle).trim(),
        lessonType,
        mediaUrl,
        mediaPublicId,
        description: description || null,
        departmentId: rules.lessonDepartmentId,
        dateStart: start,
        dateEnd: end,
        progressPoints: Number(progressPoints) || 50,
        createdBy: Number(user.suid),
        roleCode: user.roleCode,
        assignScope: rules.scope,
        assignDepartmentId: rules.assignDepartmentId,
        assignSectionId: rules.assignSectionId,
        assignStudentId: rules.assignStudentId,
        assignGroupId: rules.assignGroupId,
        assignHeadOnly: rules.assignHeadOnly,
      })

      try {
        await createLessonNotifications(lesson, user)
      } catch (error: unknown) {
        console.error('Unable to create lesson notifications.', error)
      }

      return response
        .status(201)
        .json({ success: true, message: 'Lesson create thai gayu!', data: this.toApi(lesson) })
    } catch (error: any) {
      if (mediaPublicId) {
        await cloudinary.uploader.destroy(mediaPublicId).catch(() => null)
      }
      if (error.code === '23503') {
        return response.status(400).json({
          success: false,
          message: 'Select karelu department/section/student/group exist nathi karatu.',
        })
      }
      return response.status(500).json({
        success: false,
        message: error.message || 'Lesson create karva ma error aavi.',
      })
    }
  }

  // GET /lessons/my  -> je lessons mane assign thaya chhe
  public async myLessons({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!(await this.can(user, 'MyLessons', 'view'))) {
      return response
        .status(403)
        .json({ success: false, message: 'Tamne My Lessons jovani permission nathi.' })
    }

    if (user.roleCode === 'SUPER_ADMIN') {
      return response.status(200).json({ success: true, data: [] })
    }

    try {
      const lessons = await Lesson.query()
        .preload('department')
        .preload('creator')
        .orderBy('date_start', 'desc')

      const audienceByLesson = await Promise.all(lessons.map(resolveLessonAudience))
      const currentSuid = Number(user.suid)
      const visibleLessons = lessons.filter((_, index) =>
        audienceByLesson[index].includes(currentSuid)
      )
      return response
        .status(200)
        .json({ success: true, data: visibleLessons.map((lesson) => this.toApi(lesson)) })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: error.message || 'Lessons fetch karva ma error aavi.',
      })
    }
  }

  // GET /lessons/created -> me banavela lessons (SUPER_ADMIN ne badha)
  public async created({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!(await this.can(user, 'Lesson', 'view'))) {
      return response
        .status(403)
        .json({ success: false, message: 'Tamne lesson list jovani permission nathi.' })
    }

    try {
      const query = Lesson.query()
        .preload('department')
        .preload('creator')
        .orderBy('created_at', 'desc')

      if (user.roleCode !== 'SUPER_ADMIN') {
        query.where('created_by', String(user.suid))
      }

      const lessons = await query
      return response.status(200).json({ success: true, data: lessons.map((l) => this.toApi(l)) })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: error.message || 'Lessons fetch karva ma error aavi.',
      })
    }
  }

  // DELETE /lessons/delete/:id
  public async destroy({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const lessonId = Number(params.id)
    if (!lessonId) {
      return response.status(400).json({ success: false, message: 'Invalid ID' })
    }

    const lesson = await Lesson.find(lessonId)
    if (!lesson) {
      return response.status(404).json({ success: false, message: 'Lesson na madyu.' })
    }

    const isOwner = String(lesson.createdBy) === String(user.suid)
    if (!isOwner && user.roleCode !== 'SUPER_ADMIN') {
      return response
        .status(403)
        .json({ success: false, message: 'Tamne aa lesson delete karvani permission nathi.' })
    }

    try {
      await lesson.delete()
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: error.message || 'Lesson delete karva ma error aavi.',
      })
    }

    if (lesson.mediaPublicId) {
      const resourceType =
        lesson.lessonType === 'video' || lesson.lessonType === 'audio'
          ? 'video'
          : lesson.lessonType === 'document'
            ? 'raw'
            : 'image'
      try {
        await cloudinary.uploader.destroy(lesson.mediaPublicId, { resource_type: resourceType })
      } catch {
        // ignore
      }
    }

    return response.status(200).json({ success: true, message: 'Lesson delete thai gayu.' })
  }
}
