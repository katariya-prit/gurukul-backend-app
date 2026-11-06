import db from '@adonisjs/lucid/services/db'
import transmit from '@adonisjs/transmit/services/main'
import Lesson from '#models/lesson'
import User from '#models/user'
import type {
  NotificationRecipient,
  RouteNotificationData,
  RouteNotificationRule,
} from '../notifications/route_notifications.js'
import { resolveLessonAudience } from '#services/lesson_audience_service'

export async function createLessonNotifications(lesson: Lesson, creator: User) {
  const audienceIds = await resolveLessonAudience(lesson)
  const recipientIds = audienceIds.filter(
    (recipientId) => String(recipientId) !== String(creator.suid)
  )
  const creatorName = creator.name || creator.username

  const rows = recipientIds.map((userId) => ({
    type: 'lesson',
    title: 'New lesson assigned',
    message: `${creatorName} assigned you the lesson ${lesson.lessonTitle}`,
    target_role: null,
    related_id: null,
    is_read: false,
    user_id: String(userId),
    actor_id: String(creator.suid),
    route_key: 'lesson.assigned',
    entity_type: 'lesson',
    entity_id: String(lesson.lessonId),
    link: '/dashboard/lessons/my-lessons',
    meta: {
      actor_name: creatorName,
      entity_type: 'lesson',
      entity_id: String(lesson.lessonId),
    },
  }))

  for (let index = 0; index < rows.length; index += 500) {
    await db.table('notifications').insert(rows.slice(index, index + 500))
  }
}

interface NotificationRow {
  id: number
  user_id: string | number | bigint
  title: string
  message: string
  type: string
  link: string | null
  is_read: boolean
  created_at: Date | string
  entity_type: string | null
  entity_id: string | null
  route_key: string
}

function asId(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') {
    return null
  }
  const id = String(value).trim()
  return id.length > 0 ? id : null
}

function asIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map(asId).filter((id): id is string => id !== null)
}

async function getLesson(
  target: Extract<NotificationRecipient, { kind: 'lessonAudience' | 'lessonCreator' }>
) {
  if (target.lesson) return target.lesson
  const lessonId = asId(target.lessonId)
  return lessonId ? await Lesson.find(Number(lessonId)) : null
}

async function resolveTargetIds(
  target: NotificationRecipient,
  data: RouteNotificationData
): Promise<string[]> {
  switch (target.kind) {
    case 'superAdmins': {
      const users = await User.query()
        .where('status', 'APPROVED')
        .where('roleCode', 'SUPER_ADMIN')
        .select('suid')
      return users.map(({ suid }) => String(suid))
    }
    case 'actor':
      return data.actor.id ? [data.actor.id] : []
    case 'user': {
      const id = asId(target.id)
      return id ? [id] : []
    }
    case 'roleHolders': {
      if (!target.roleCode) return []
      const users = await User.query()
        .where('roleCode', target.roleCode)
        .where('status', 'APPROVED')
        .select('suid')
      return users.map(({ suid }) => String(suid))
    }
    case 'departmentHead': {
      const departmentId = asId(target.departmentId)
      if (!departmentId) return []
      const department = await db
        .from('departments')
        .where('department_id', departmentId)
        .select('department_head_id')
        .first()
      const id = asId(department?.department_head_id)
      return id ? [id] : []
    }
    case 'departmentMembers': {
      const departmentId = asId(target.departmentId)
      if (!departmentId) return []
      const users = await User.query()
        .where('departmentId', departmentId)
        .where('status', 'APPROVED')
        .select('suid')
      return users.map(({ suid }) => String(suid))
    }
    case 'sectionMembers': {
      const sectionId = asId(target.sectionId)
      if (!sectionId) return []
      const users = await User.query()
        .where('sectionId', sectionId)
        .where('status', 'APPROVED')
        .select('suid')
      return users.map(({ suid }) => String(suid))
    }
    case 'groupMembers': {
      let memberIds = asIds(target.memberIds)
      if (memberIds.length === 0) {
        const groupId = asId(target.groupId)
        if (!groupId) return []
        const group = await db
          .from('groups')
          .where('group_id', groupId)
          .select('member_ids')
          .first()
        memberIds = asIds(group?.member_ids)
      }
      return memberIds
    }
    case 'lessonAudience': {
      const lesson = await getLesson(target)
      if (!lesson) return []
      const audience = await resolveLessonAudience(lesson)
      return audience.map(String)
    }
    case 'lessonCreator': {
      const lesson = await getLesson(target)
      if (!lesson) return []
      const creatorId = 'createdBy' in lesson ? lesson.createdBy : lesson.created_by
      const id = asId(creatorId)
      return id ? [id] : []
    }
  }
}

function serializeNotification(row: NotificationRow) {
  const createdAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    link: row.link,
    is_read: row.is_read,
    created_at: createdAt,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    route_key: row.route_key,
  }
}

export async function notify(data: RouteNotificationData, rule: RouteNotificationRule) {
  const configuredRecipients = rule.recipients(data)
  const includesActor = configuredRecipients.some((recipient) => recipient.kind === 'actor')
  const uniqueAssignments = new Map<string, NotificationRecipient>()

  for (const recipient of configuredRecipients) {
    const ids = await resolveTargetIds(recipient, data)
    for (const candidate of ids) {
      const id = asId(candidate)
      if (!id || (!includesActor && id === data.actor.id)) continue
      if (!uniqueAssignments.has(id)) uniqueAssignments.set(id, recipient)
    }
  }

  const ids = [...uniqueAssignments.keys()]
  if (ids.length === 0) return

  const approvedRows = await db
    .from('users')
    .whereIn('suid', ids)
    .where('status', 'APPROVED')
    .select('suid')
  const approvedIds = new Set(approvedRows.map((row) => String(row.suid)))
  const entity = rule.entity
  const entityId = entity?.id(data) ?? null
  const actorId = data.actor.id
  const rowsToInsert = [...uniqueAssignments.entries()]
    .filter(([id]) => approvedIds.has(id))
    .map(([userId, recipient]) => ({
      type: rule.type,
      title: rule.title,
      message: rule.message(data, recipient),
      target_role: null,
      related_id: null,
      is_read: false,
      user_id: userId,
      actor_id: actorId,
      route_key: data.routeKey,
      entity_type: entity?.type ?? null,
      entity_id: entityId,
      link: rule.link(data, recipient),
      meta: {
        actor_name: data.actor.name,
        entity_type: entity?.type ?? null,
        entity_id: entityId,
      },
    }))

  if (rowsToInsert.length === 0) return

  const inserted = await db.transaction(async (trx) => {
    const rows = await trx
      .table('notifications')
      .insert(rowsToInsert)
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
    return rows as NotificationRow[]
  })

  for (const row of inserted) {
    try {
      await transmit.broadcast(`notifications/${String(row.user_id)}`, serializeNotification(row))
    } catch (error: unknown) {
      console.error(`Notification broadcast failed for user ${String(row.user_id)}.`, error)
    }
  }
}
