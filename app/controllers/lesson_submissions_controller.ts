import type { HttpContext } from '@adonisjs/core/http'
import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'
import Lesson from '#models/lesson'
import LessonSubmission from '#models/lesson_submission'
import type User from '#models/user'
import { resolveLessonAudience } from '#services/lesson_audience_service'
import LessonSubmissionEvaluationService from '#services/lesson_submission_evaluation_service'

cloudinary.config({
  cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: env.get('CLOUDINARY_API_KEY'),
  api_secret: env.get('CLOUDINARY_API_SECRET'),
  secure: true,
})

const evaluationService = new LessonSubmissionEvaluationService()
const cloudinaryResourceType = (lessonType: string) =>
  lessonType === 'audio' || lessonType === 'video'
    ? 'video'
    : lessonType === 'document'
      ? 'raw'
      : 'image'
const mediaRules = {
  video: { size: '500mb', extnames: ['mp4', 'mov', 'webm', 'm4v'] },
  audio: { size: '100mb', extnames: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'mp4'] },
  image: { size: '20mb', extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
  document: { size: '50mb', extnames: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'] },
}

type SubmissionWithStudent = LessonSubmission & { student?: User }

function serialize(submission: SubmissionWithStudent) {
  return {
    submission_id: submission.submissionId,
    lesson_id: submission.lessonId,
    student_id: String(submission.studentId),
    student_name: submission.student?.name ?? '',
    student_avatar: submission.student?.avatar ?? null,
    media_url: submission.mediaUrl,
    source: submission.source,
    ai_status: submission.aiStatus,
    ai_percent: submission.aiPercent,
    ai_points: submission.aiPoints,
    ai_result: submission.aiResult,
    ai_error: submission.aiError,
    skip_reason: submission.skipReason,
    needs_review: submission.needsReview,
    teacher_points: submission.teacherPoints,
    teacher_feedback: submission.teacherFeedback,
    final_points: submission.finalPoints,
    created_at: submission.createdAt
      ? typeof (submission.createdAt as any).toISO === 'function'
        ? (submission.createdAt as any).toISO()
        : String(submission.createdAt)
      : new Date().toISOString(),
  }
}

export default class LessonSubmissionsController {
  private async canManage(user: User, lesson: Lesson) {
    return user.roleCode === 'SUPER_ADMIN' || String(lesson.createdBy) === String(user.suid)
  }

  private async loadSubmission(submissionId: unknown) {
    const id = Number(submissionId)
    if (!Number.isSafeInteger(id) || id < 1) return null
    return LessonSubmission.query().where('submission_id', id).preload('student').first()
  }

  public async mine({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const submissions = await LessonSubmission.query()
        .where('student_id', user.suid as any)
        .preload('student')
        .orderBy('created_at', 'desc')
      return response.ok({ success: true, data: submissions.map(serialize) })
    } catch (error: any) {
      console.error('mine submissions error:', error)
      return response.ok({ success: true, data: [] })
    }
  }

  public async submit({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const lessonId = Number(params.id)
    if (!Number.isSafeInteger(lessonId) || lessonId < 1) {
      return response.badRequest({ success: false, message: 'Invalid lesson ID.' })
    }

    const lesson = await Lesson.find(lessonId)
    if (!lesson) return response.notFound({ success: false, message: 'Lesson not found.' })

    const audience = await resolveLessonAudience(lesson)
    if (!audience.some((id) => String(id) === String(user.suid))) {
      return response.forbidden({ success: false, message: 'This lesson is not assigned to you.' })
    }

    const rules = mediaRules[lesson.lessonType as keyof typeof mediaRules]
    if (!rules) {
      return response.badRequest({ success: false, message: 'Unsupported lesson type.' })
    }
    const file = request.file('file', rules)
    if (!file) return response.badRequest({ success: false, message: 'Select a file to submit.' })
    if (!file.isValid) {
      return response.badRequest({
        success: false,
        message: file.errors[0]?.message ?? 'Invalid submission file.',
      })
    }

    const source = request.input('source', 'upload')
    if (!['upload', 'recorded', 'live'].includes(source)) {
      return response.badRequest({ success: false, message: 'Invalid submission source.' })
    }
    if (lesson.lessonType !== 'audio' && source !== 'upload') {
      return response.badRequest({
        success: false,
        message: 'Recorded and live submissions are only supported for audio lessons.',
      })
    }

    const previousSubmission = await LessonSubmission.query()
      .where('lesson_id', lessonId)
      .where('student_id', user.suid as any)
      .first()
    let uploaded: Awaited<ReturnType<typeof cloudinary.uploader.upload>>
    try {
      uploaded = await cloudinary.uploader.upload(file.tmpPath!, {
        folder: 'gurukul/lesson-submissions',
        resource_type: cloudinaryResourceType(lesson.lessonType),
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: error instanceof Error ? error.message : 'Unable to upload submission media.',
      })
    }

    let submission: LessonSubmission
    try {
      submission = await LessonSubmission.updateOrCreate(
        { lessonId, studentId: user.suid },
        {
          mediaUrl: uploaded.secure_url,
          mediaPublicId: uploaded.public_id,
          source,
          aiStatus: 'pending',
          aiPercent: null,
          aiPoints: null,
          aiResult: null,
          aiError: null,
          skipReason: null,
          needsReview: false,
          teacherPoints: null,
          teacherFeedback: null,
          finalPoints: null,
        }
      )
    } catch (error) {
      await cloudinary.uploader
        .destroy(uploaded.public_id, {
          resource_type: cloudinaryResourceType(lesson.lessonType),
        })
        .catch((cleanupError: unknown) => {
          console.error('Unable to remove an unassociated lesson submission upload.', cleanupError)
        })
      return response.internalServerError({
        success: false,
        message: error instanceof Error ? error.message : 'Unable to save submission.',
      })
    }

    if (previousSubmission) {
      await cloudinary.uploader
        .destroy(previousSubmission.mediaPublicId, {
          resource_type: cloudinaryResourceType(lesson.lessonType),
        })
        .catch((error: unknown) => {
          console.error('Unable to remove replaced lesson submission media.', error)
        })
    }

    void evaluationService.evaluate(submission.submissionId).catch((error: unknown) => {
      console.error('Unable to start lesson submission evaluation.', error)
    })
    await submission.load('student')
    return response.created({ success: true, data: serialize(submission) })
  }

  public async forLesson({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const lessonId = Number(params.id)
    const lesson = Number.isSafeInteger(lessonId) ? await Lesson.find(lessonId) : null
    if (!lesson) return response.notFound({ success: false, message: 'Lesson not found.' })
    if (!(await this.canManage(user, lesson))) {
      return response.forbidden({ success: false, message: 'You cannot view these submissions.' })
    }

    const submissions = await LessonSubmission.query()
      .where('lesson_id', lessonId)
      .preload('student')
      .orderBy('created_at', 'desc')
    return response.ok({ success: true, data: submissions.map(serialize) })
  }

  public async grade({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const submission = await this.loadSubmission(params.submissionId)
    if (!submission) return response.notFound({ success: false, message: 'Submission not found.' })

    const lesson = await Lesson.find(submission.lessonId)
    if (!lesson) return response.notFound({ success: false, message: 'Lesson not found.' })
    if (!(await this.canManage(user, lesson))) {
      return response.forbidden({ success: false, message: 'You cannot grade this submission.' })
    }

    const points = Number(request.input('points'))
    const feedback = request.input('feedback', '')
    const maxPoints = Number(lesson.progressPoints ?? 50)
    if (!Number.isFinite(points) || points < 0 || points > maxPoints) {
      return response.badRequest({
        success: false,
        message: `Points must be between 0 and ${maxPoints}.`,
      })
    }
    if (typeof feedback !== 'string') {
      return response.badRequest({ success: false, message: 'Feedback must be text.' })
    }

    submission.teacherPoints = points
    submission.teacherFeedback = feedback.trim().slice(0, 5000) || null
    submission.finalPoints = points
    submission.needsReview = false
    await submission.save()
    return response.ok({ success: true, data: serialize(submission) })
  }

  public async reEvaluate({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const submission = await this.loadSubmission(params.submissionId)
    if (!submission) return response.notFound({ success: false, message: 'Submission not found.' })

    const lesson = await Lesson.find(submission.lessonId)
    if (!lesson) return response.notFound({ success: false, message: 'Lesson not found.' })
    if (!(await this.canManage(user, lesson))) {
      return response.forbidden({
        success: false,
        message: 'You cannot re-evaluate this submission.',
      })
    }

    submission.aiStatus = 'pending'
    submission.aiPercent = null
    submission.aiPoints = null
    submission.aiResult = null
    submission.aiError = null
    submission.skipReason = null
    submission.needsReview = false
    submission.finalPoints = submission.teacherPoints
    await submission.save()
    void evaluationService.evaluate(submission.submissionId).catch((error: unknown) => {
      console.error('Unable to start lesson submission re-evaluation.', error)
    })
    return response.ok({ success: true, data: serialize(submission) })
  }
}
