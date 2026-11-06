import { GoogleGenAI } from '@google/genai'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import Lesson from '#models/lesson'
import LessonSubmission, { type AiResult } from '#models/lesson_submission'

const MAX_INLINE_MEDIA_BYTES = 15 * 1024 * 1024
const DEFAULT_MODEL = 'gemini-2.5-flash'
const CLOUDINARY_HOST = 'res.cloudinary.com'

interface EvaluatedResult extends AiResult {
  percent: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseEvaluation(value: string): EvaluatedResult {
  const json = value.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()
  const parsed: unknown = JSON.parse(json)
  if (!isRecord(parsed) || !Array.isArray(parsed.criteria)) {
    throw new Error('Gemini returned an invalid evaluation result')
  }

  const criteria = parsed.criteria.flatMap((item): AiResult['criteria'] => {
    if (!isRecord(item) || typeof item.key !== 'string' || typeof item.score !== 'number') {
      return []
    }
    return [
      {
        key: item.key.slice(0, 100),
        score: Math.max(0, Math.min(100, item.score)),
        comment: typeof item.comment === 'string' ? item.comment.slice(0, 500) : '',
      },
    ]
  })
  const percent = typeof parsed.percent === 'number' ? parsed.percent : Number.NaN
  if (criteria.length === 0 || !Number.isFinite(percent)) {
    throw new Error('Gemini returned an incomplete evaluation result')
  }

  const strings = (input: unknown) =>
    Array.isArray(input)
      ? input.filter((entry): entry is string => typeof entry === 'string').slice(0, 8)
      : []
  return {
    criteria,
    percent: Math.max(0, Math.min(100, percent)),
    summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 1000) : '',
    strengths: strings(parsed.strengths),
    improvements: strings(parsed.improvements),
    confidence:
      typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0,
    flags: strings(parsed.flags),
  }
}

async function downloadCloudinaryMedia(url: string) {
  const parsedUrl = new URL(url)
  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== CLOUDINARY_HOST) {
    throw new Error('Submission media URL is not a trusted Cloudinary URL')
  }
  const response = await fetch(parsedUrl, {
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`Unable to retrieve media (${response.status})`)
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_INLINE_MEDIA_BYTES) {
    throw new Error('Media is too large for inline AI evaluation')
  }
  if (!response.body) throw new Error('Media response had no content')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > MAX_INLINE_MEDIA_BYTES) {
      await reader.cancel()
      throw new Error('Media is too large for inline AI evaluation')
    }
    chunks.push(value)
  }
  const buffer = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
  return {
    data: buffer.toString('base64'),
    mimeType: response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream',
  }
}

export default class LessonSubmissionEvaluationService {
  async evaluate(submissionId: number) {
    const submission = await LessonSubmission.findOrFail(submissionId)
    const lesson = await Lesson.findOrFail(submission.lessonId)
    submission.aiStatus = 'processing'
    submission.aiError = null
    submission.skipReason = null
    await submission.save()

    const apiKey = env.get('GEMINI_API_KEY')
    if (!apiKey) {
      submission.aiStatus = 'skipped'
      submission.skipReason = 'AI scoring is not configured. Your teacher can review your work.'
      await submission.save()
      return
    }
    if (!lesson.mediaUrl) {
      submission.aiStatus = 'skipped'
      submission.skipReason =
        'The teacher reference is unavailable. Your teacher can review your work.'
      await submission.save()
      return
    }

    try {
      const [reference, work] = await Promise.all([
        downloadCloudinaryMedia(lesson.mediaUrl ?? ''),
        downloadCloudinaryMedia(submission.mediaUrl),
      ])
      const response = await new GoogleGenAI({ apiKey }).models.generateContent({
        model: env.get('GEMINI_EVAL_MODEL') || DEFAULT_MODEL,
        contents: [
          {
            text: [
              'Evaluate the student work against the teacher reference for the lesson.',
              `Lesson title: ${lesson.lessonTitle}`,
              `Lesson type: ${lesson.lessonType}`,
              'Return only valid JSON with keys: percent (0-100), criteria (array of {key, score 0-100, comment}), summary, strengths (string array), improvements (string array), confidence (0-1), flags (string array).',
              'Be fair, do not infer identity, and do not reward content unrelated to the reference.',
            ].join('\n'),
          },
          { inlineData: reference },
          { inlineData: work },
        ],
      })
      if (!response.text) throw new Error('Gemini returned an empty evaluation')

      const result = parseEvaluation(response.text)
      submission.aiResult = {
        criteria: result.criteria,
        summary: result.summary,
        strengths: result.strengths,
        improvements: result.improvements,
        confidence: result.confidence,
        flags: result.flags,
      }
      submission.aiPercent = result.percent
      submission.aiPoints = Math.round(((lesson.progressPoints ?? 50) * result.percent) / 100)
      submission.finalPoints = submission.teacherPoints ?? submission.aiPoints
      submission.aiStatus = 'done'
      submission.needsReview = result.confidence < 0.6 || result.flags.length > 0
      await submission.save()
      await this.notifyEvaluationComplete(submission, lesson)
    } catch (error) {
      logger.error({ err: error, submissionId }, 'Lesson submission AI evaluation failed')
      submission.aiStatus = 'failed'
      submission.aiError = error instanceof Error ? error.message : 'AI evaluation failed'
      submission.needsReview = true
      await submission.save()
    }
  }

  private async notifyEvaluationComplete(submission: LessonSubmission, lesson: Lesson) {
    try {
      const user = await submission.related('student').query().first()
      if (!user) return
      const [notification] = await db
        .table('notifications')
        .insert({
          type: 'lesson',
          title: 'Lesson evaluation complete',
          message: `Your work for ${lesson.lessonTitle} has been evaluated.`,
          is_read: false,
          user_id: String(user.suid),
          actor_id: null,
          route_key: 'ai.evaluation.completed',
          entity_type: 'lesson_submission',
          entity_id: String(submission.submissionId),
          link: '/dashboard/lessons/my-lessons',
          meta: { lesson_id: lesson.lessonId, submission_id: submission.submissionId },
        })
        .returning([
          'id',
          'user_id',
          'title',
          'message',
          'type',
          'link',
          'is_read',
          'created_at',
          'entity_type',
          'entity_id',
          'route_key',
        ])
      if (!notification) return
      const createdAt =
        notification.created_at instanceof Date
          ? notification.created_at.toISOString()
          : String(notification.created_at)
      await transmit.broadcast(`notifications/${String(notification.user_id)}`, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        is_read: notification.is_read,
        created_at: createdAt,
        entity_type: notification.entity_type,
        entity_id: notification.entity_id,
        route_key: notification.route_key,
      })
    } catch (error) {
      logger.error(
        { err: error, submissionId: submission.submissionId },
        'Unable to send lesson evaluation notification'
      )
    }
  }
}
