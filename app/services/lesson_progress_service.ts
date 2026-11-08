import { DateTime } from 'luxon'
import Lesson from '#models/lesson'
import LessonSubmission from '#models/lesson_submission'
import { resolveLessonAudience } from '#services/lesson_audience_service'

const COUNT_ONLY_GRADED = false
const GROWTH_BUCKETS = 12

export type LessonProgressPeriod = 'week' | 'month'
export type LessonItemStatus = 'pending' | 'submitted' | 'graded'

export type LessonStats = {
  totalLessons: number
  submittedLessons: number
  lessonCompletionPercent: number
  totalLessonPoints: number
  earnedLessonPoints: number
  lessonScorePercent: number
}

export type StudentLessonItem = {
  lessonId: number
  title: string
  type: string
  dateStart: string
  dateEnd: string
  maxPoints: number
  status: LessonItemStatus
  earnedPoints: number | null
  submittedAt: string | null
}

export type LessonGrowthPoint = {
  periodStart: string
  periodEnd: string
  newSubmissions: number
  cumulativeSubmissions: number
  assignedLessons: number
  completionPercent: number
  cumulativePoints: number
}

export type LessonGrowth = {
  period: LessonProgressPeriod
  points: LessonGrowthPoint[]
  currentPercent: number
  previousPercent: number
  changePercent: number
}

type Pair = { suid: number; lesson: Lesson }
type SubmissionInfo = { submittedAt: DateTime; earned: number | null }
type Context = { pairs: Pair[]; submissions: Map<string, SubmissionInfo> }

const percentOf = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100)

const pairKey = (suid: number, lessonId: number): string => `${suid}:${lessonId}`

const formatDate = (value: DateTime): string => value.toFormat('yyyy-LL-dd')

const maxPointsOf = (lesson: Lesson): number => Number(lesson.progressPoints) || 0

const isCounted = (info: SubmissionInfo): boolean => !COUNT_ONLY_GRADED || info.earned !== null

export const emptyLessonStats = (): LessonStats => ({
  totalLessons: 0,
  submittedLessons: 0,
  lessonCompletionPercent: 0,
  totalLessonPoints: 0,
  earnedLessonPoints: 0,
  lessonScorePercent: 0,
})

const finalizeStats = (stats: LessonStats): LessonStats => ({
  ...stats,
  lessonCompletionPercent: percentOf(stats.submittedLessons, stats.totalLessons),
  lessonScorePercent: percentOf(stats.earnedLessonPoints, stats.totalLessonPoints),
})

export const mergeLessonStats = (list: LessonStats[]): LessonStats => {
  const sum = emptyLessonStats()
  for (const item of list) {
    sum.totalLessons += item.totalLessons
    sum.submittedLessons += item.submittedLessons
    sum.totalLessonPoints += item.totalLessonPoints
    sum.earnedLessonPoints += item.earnedLessonPoints
  }
  return finalizeStats(sum)
}

const accumulate = (stats: LessonStats, lesson: Lesson, info: SubmissionInfo | undefined) => {
  const max = maxPointsOf(lesson)
  stats.totalLessons += 1
  stats.totalLessonPoints += max
  if (info && isCounted(info)) {
    stats.submittedLessons += 1
    stats.earnedLessonPoints += Math.min(info.earned ?? 0, max)
  }
}

export default class LessonProgressService {
  private async loadContext(suids: number[]): Promise<Context> {
    if (suids.length === 0) return { pairs: [], submissions: new Map() }

    const wanted = new Set(suids)
    const today = DateTime.now().toFormat('yyyy-LL-dd')
    const lessons = await Lesson.query().where('date_start', '<=', today)
    const audiences = await Promise.all(lessons.map((lesson) => resolveLessonAudience(lesson)))

    const pairs: Pair[] = []
    lessons.forEach((lesson, index) => {
      const unique = new Set(audiences[index].map((id) => Number(id)))
      for (const suid of unique) {
        if (wanted.has(suid)) pairs.push({ suid, lesson })
      }
    })

    const rows = await LessonSubmission.query().whereIn('student_id', suids)
    const submissions = new Map<string, SubmissionInfo>()
    for (const row of rows) {
      const earned = row.finalPoints ?? row.aiPoints
      submissions.set(pairKey(Number(row.studentId), row.lessonId), {
        submittedAt: row.createdAt,
        earned: earned === null ? null : Number(earned),
      })
    }

    return { pairs, submissions }
  }

  async forStudents(suids: number[]): Promise<Map<number, LessonStats>> {
    const { pairs, submissions } = await this.loadContext(suids)
    const result = new Map<number, LessonStats>()
    for (const suid of suids) result.set(suid, emptyLessonStats())

    for (const { suid, lesson } of pairs) {
      const stats = result.get(suid)
      if (stats) accumulate(stats, lesson, submissions.get(pairKey(suid, lesson.lessonId)))
    }

    for (const [suid, stats] of result) result.set(suid, finalizeStats(stats))
    return result
  }

  async studentDetail(suid: number): Promise<{ stats: LessonStats; items: StudentLessonItem[] }> {
    const { pairs, submissions } = await this.loadContext([suid])
    const stats = emptyLessonStats()
    const items: StudentLessonItem[] = []

    for (const { lesson } of pairs) {
      const info = submissions.get(pairKey(suid, lesson.lessonId))
      accumulate(stats, lesson, info)
      items.push({
        lessonId: lesson.lessonId,
        title: lesson.lessonTitle,
        type: lesson.lessonType,
        dateStart: formatDate(lesson.dateStart),
        dateEnd: formatDate(lesson.dateEnd),
        maxPoints: maxPointsOf(lesson),
        status: !info ? 'pending' : info.earned === null ? 'submitted' : 'graded',
        earnedPoints: info?.earned ?? null,
        submittedAt: info ? info.submittedAt.toISO() : null,
      })
    }

    items.sort((a, b) => b.dateStart.localeCompare(a.dateStart))
    return { stats: finalizeStats(stats), items }
  }

  async growth(suids: number[], period: LessonProgressPeriod): Promise<LessonGrowth> {
    const { pairs, submissions } = await this.loadContext(suids)
    const now = DateTime.now()
    const shift = (amount: number) => (period === 'week' ? { weeks: amount } : { months: amount })
    const currentStart = now.startOf(period)
    const points: LessonGrowthPoint[] = []

    for (let i = 0; i < GROWTH_BUCKETS; i++) {
      const start = currentStart.minus(shift(GROWTH_BUCKETS - 1 - i))
      const end = i === GROWTH_BUCKETS - 1 ? now : start.endOf(period)
      const startMs = start.toMillis()
      const endMs = end.toMillis()

      let assigned = 0
      let cumulative = 0
      let fresh = 0
      let cumulativePoints = 0

      for (const { suid, lesson } of pairs) {
        if (lesson.dateStart.toMillis() > endMs) continue
        assigned += 1

        const info = submissions.get(pairKey(suid, lesson.lessonId))
        if (!info || !isCounted(info)) continue

        const submittedMs = info.submittedAt.toMillis()
        if (submittedMs > endMs) continue

        cumulative += 1
        cumulativePoints += Math.min(info.earned ?? 0, maxPointsOf(lesson))
        if (submittedMs >= startMs) fresh += 1
      }

      points.push({
        periodStart: formatDate(start),
        periodEnd: formatDate(end),
        newSubmissions: fresh,
        cumulativeSubmissions: cumulative,
        assignedLessons: assigned,
        completionPercent: percentOf(cumulative, assigned),
        cumulativePoints,
      })
    }

    const current = points[points.length - 1].completionPercent
    const previous = points[points.length - 2].completionPercent

    return {
      period,
      points,
      currentPercent: current,
      previousPercent: previous,
      changePercent: current - previous,
    }
  }
}