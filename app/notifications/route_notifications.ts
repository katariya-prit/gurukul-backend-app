import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { LessonAudienceRecord } from '#services/lesson_audience_service'

type IdValue = string | number | bigint | null | undefined
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationActor {
  id: string | null
  name: string
  roleCode: string | null
}

export interface RouteNotificationData {
  method: string
  routeKey: string
  actor: NotificationActor
  params: Record<string, string>
  body: Record<string, unknown>
  result: Record<string, unknown> | null
  snapshot: Record<string, unknown> | null
}

export type NotificationRecipient =
  | { kind: 'superAdmins' }
  | { kind: 'actor' }
  | { kind: 'user'; id: IdValue }
  | { kind: 'roleHolders'; roleCode: string | null }
  | { kind: 'departmentHead'; departmentId: IdValue }
  | { kind: 'departmentMembers'; departmentId: IdValue }
  | { kind: 'sectionMembers'; sectionId: IdValue }
  | { kind: 'groupMembers'; groupId?: IdValue; memberIds?: unknown }
  | { kind: 'lessonAudience'; lessonId?: IdValue; lesson?: LessonAudienceRecord }
  | { kind: 'lessonCreator'; lessonId?: IdValue; lesson?: LessonAudienceRecord }

export interface RouteNotificationRule {
  title: string
  message: (data: RouteNotificationData, recipient: NotificationRecipient) => string
  type: NotificationType
  recipients: (data: RouteNotificationData) => NotificationRecipient[]
  link: (data: RouteNotificationData, recipient: NotificationRecipient) => string | null
  entity: {
    type: string
    id: (data: RouteNotificationData) => string | null
  } | null
  snapshot?: (ctx: HttpContext) => Promise<Record<string, unknown> | null>
}

function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  return typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate)
}

function value(record: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!record) return undefined
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key]
  }
  return undefined
}

function resultValue(data: RouteNotificationData, ...keys: string[]): unknown {
  const nested = isRecord(data.result?.data) ? data.result.data : null
  return value(nested, ...keys) ?? value(data.result, ...keys)
}

function firstValue(
  sources: Array<Record<string, unknown> | null | undefined>,
  ...keys: string[]
): unknown {
  for (const source of sources) {
    const found = value(source, ...keys)
    if (found !== undefined && found !== null) return found
  }
  return undefined
}

function asId(candidate: unknown): string | null {
  if (
    typeof candidate !== 'string' &&
    typeof candidate !== 'number' &&
    typeof candidate !== 'bigint'
  ) {
    return null
  }
  const id = String(candidate).trim()
  return id.length > 0 ? id : null
}

function asIds(candidate: unknown): string[] {
  if (!Array.isArray(candidate)) return []
  return candidate.map(asId).filter((id): id is string => id !== null)
}

function makeRule(options: {
  title: string
  message: RouteNotificationRule['message']
  recipients: RouteNotificationRule['recipients']
  link: string | RouteNotificationRule['link']
  entityType?: string
  entityId?: (data: RouteNotificationData) => string | null
  type?: NotificationType
  snapshot?: RouteNotificationRule['snapshot']
}): RouteNotificationRule {
  const configuredLink = options.link
  const link = typeof configuredLink === 'string' ? () => configuredLink : configuredLink

  return {
    title: options.title,
    message: options.message,
    type: options.type ?? 'info',
    recipients: options.recipients,
    link,
    entity: options.entityType
      ? {
          type: options.entityType,
          id: options.entityId ?? (() => null),
        }
      : null,
    ...(options.snapshot ? { snapshot: options.snapshot } : {}),
  }
}

async function snapshotUser(ctx: HttpContext) {
  return (
    (await db
      .from('users')
      .where('suid', ctx.params.id)
      .select('suid', 'name', 'role_code', 'department_id', 'section_id')
      .first()) ?? null
  )
}

async function snapshotDepartment(ctx: HttpContext) {
  const department = await db
    .from('departments')
    .where('department_id', ctx.params.id)
    .select('department_id', 'department_name', 'department_head_id')
    .first()
  if (!department) return null
  const members = await db
    .from('users')
    .where('department_id', department.department_id)
    .select('suid')
  return { ...department, member_ids: members.map((member) => member.suid) }
}

async function snapshotSection(ctx: HttpContext) {
  const section = await db
    .from('sections')
    .where('section_id', ctx.params.id)
    .select('section_id', 'name', 'department_id', 'section_head_id')
    .first()
  if (!section) return null
  const members = await db.from('users').where('section_id', section.section_id).select('suid')
  const department = await db
    .from('departments')
    .where('department_id', section.department_id)
    .select('department_head_id')
    .first()
  return {
    ...section,
    department_head_id: department?.department_head_id ?? null,
    member_ids: members.map((member) => member.suid),
  }
}

async function snapshotGroup(ctx: HttpContext) {
  return (
    (await db
      .from('groups')
      .where('group_id', ctx.params.id)
      .select('group_id', 'group_name', 'member_ids')
      .first()) ?? null
  )
}

async function snapshotLesson(ctx: HttpContext) {
  return (
    (await db
      .from('lessons')
      .where('lesson_id', ctx.params.id)
      .select(
        'lesson_id',
        'lesson_title',
        'created_by',
        'assign_scope',
        'assign_department_id',
        'assign_section_id',
        'assign_student_id',
        'assign_group_id',
        'assign_head_only'
      )
      .first()) ?? null
  )
}

async function snapshotQuote(ctx: HttpContext) {
  return (
    (await db
      .from('quotes')
      .where('id', ctx.params.id)
      .select('id', 'type', 'title', 'name')
      .first()) ?? null
  )
}

async function snapshotDailyDarshan(ctx: HttpContext) {
  return (
    (await db.from('daily_darshan').where('id', ctx.params.id).select('id', 'title').first()) ??
    null
  )
}

const superAdmins = (): NotificationRecipient => ({ kind: 'superAdmins' })
const userRecipient = (id: unknown): NotificationRecipient => ({
  kind: 'user',
  id: asId(id),
})
const groupMembers = (memberIds: unknown): NotificationRecipient => ({
  kind: 'groupMembers',
  memberIds,
})
const userRecipients = (memberIds: unknown): NotificationRecipient[] =>
  asIds(memberIds).map(userRecipient)

export const routeNotificationRules: Record<string, RouteNotificationRule> = {
  'POST /users/register': makeRule({
    title: 'New account waiting for approval',
    message: (data) => {
      const name = value(data.body, 'name')
      return typeof name === 'string' && name.trim()
        ? `${name.trim()} is waiting for account approval.`
        : 'A new account is waiting for approval.'
    },
    type: 'warning',
    recipients: (data) => {
      const status = resultValue(data, 'status')
      return status === 'PENDING' ? [superAdmins()] : []
    },
    link: '/dashboard/users/list',
    entityType: 'user',
    entityId: (data) => asId(firstValue([data.body, data.result], 'suid', 'user_id', 'userId')),
  }),
  'PUT /users/approve/:id': makeRule({
    title: 'Account approved',
    message: (_data, recipient) =>
      recipient.kind === 'user' ? 'Your account was approved.' : 'A user account was approved.',
    type: 'success',
    recipients: (data) => [userRecipient(data.params.id), superAdmins()],
    link: '/dashboard/users/list',
    entityType: 'user',
    entityId: (data) => asId(data.params.id),
  }),
  'PUT /users/:id': makeRule({
    title: 'Account updated',
    message: (_data, recipient) =>
      recipient.kind === 'user' ? 'Your account was updated.' : 'A user account was updated.',
    recipients: (data) => [userRecipient(data.params.id), superAdmins()],
    link: '/dashboard/users/list',
    entityType: 'user',
    entityId: (data) => asId(data.params.id),
    snapshot: snapshotUser,
  }),
  'DELETE /users/delete/:id': makeRule({
    title: 'Account removed',
    message: (_data, recipient) =>
      recipient.kind === 'user' ? 'Your account was removed.' : 'A user account was removed.',
    type: 'warning',
    recipients: (data) => [userRecipient(data.snapshot?.suid ?? data.params.id), superAdmins()],
    link: '/dashboard/users/list',
    entityType: 'user',
    entityId: (data) => asId(data.snapshot?.suid ?? data.params.id),
    snapshot: snapshotUser,
  }),
  'POST /departments/create': makeRule({
    title: 'Department created',
    message: (data) => {
      const name = firstValue([data.body, data.result], 'departmentName', 'department_name')
      return typeof name === 'string' && name.trim()
        ? `Department ${name.trim()} was created.`
        : 'A department was created.'
    },
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      userRecipient(value(data.body, 'departmentHeadId', 'department_head_id')),
    ],
    link: '/dashboard/departments/list',
    entityType: 'department',
    entityId: (data) =>
      asId(
        firstValue(
          [data.result, isRecord(data.result?.data) ? data.result.data : null],
          'departmentId',
          'department_id',
          'id'
        )
      ),
  }),
  'PUT /departments/:id': makeRule({
    title: 'Department updated',
    message: (data) =>
      `Department ${String(data.snapshot?.department_name ?? data.params.id)} was updated.`,
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      userRecipient(data.snapshot?.department_head_id),
      userRecipient(value(data.body, 'departmentHeadId', 'department_head_id')),
    ],
    link: '/dashboard/departments/list',
    entityType: 'department',
    entityId: (data) => asId(data.snapshot?.department_id ?? data.params.id),
    snapshot: snapshotDepartment,
  }),
  'DELETE /departments/delete/:id': makeRule({
    title: 'Department removed',
    message: (data) =>
      `Department ${String(data.snapshot?.department_name ?? data.params.id)} was removed.`,
    type: 'warning',
    recipients: (data) => [
      superAdmins(),
      ...userRecipients(data.snapshot?.member_ids),
      userRecipient(data.snapshot?.department_head_id),
    ],
    link: '/dashboard/departments/list',
    entityType: 'department',
    entityId: (data) => asId(data.snapshot?.department_id ?? data.params.id),
    snapshot: snapshotDepartment,
  }),
  'POST /roles/create': makeRule({
    title: 'Role created',
    message: (data) =>
      `Role ${String(value(data.body, 'roleCode', 'role_code') ?? '')} was created.`,
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      {
        kind: 'roleHolders',
        roleCode: asId(value(data.body, 'roleCode', 'role_code')),
      },
    ],
    link: '/dashboard/permissions/lesson',
    entityType: 'role',
    entityId: (data) => asId(value(data.body, 'roleCode', 'role_code')),
  }),
  'PUT /roles/:roleCode': makeRule({
    title: 'Role updated',
    message: (data) => `Role ${data.params.roleCode} was updated.`,
    type: 'success',
    recipients: (data) => [superAdmins(), { kind: 'roleHolders', roleCode: data.params.roleCode }],
    link: '/dashboard/permissions/lesson',
    entityType: 'role',
    entityId: (data) => asId(data.params.roleCode),
  }),
  'POST /sections/create': makeRule({
    title: 'Section created',
    message: (data) => {
      const name = value(data.body, 'name')
      return typeof name === 'string' && name.trim()
        ? `Section ${name.trim()} was created.`
        : 'A section was created.'
    },
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      {
        kind: 'departmentMembers',
        departmentId: asId(value(data.body, 'departmentId', 'department_id')),
      },
      userRecipient(value(data.body, 'sectionHeadId', 'section_head_id')),
    ],
    link: '/dashboard/sections/list',
    entityType: 'section',
    entityId: (data) =>
      asId(
        firstValue(
          [data.result, isRecord(data.result?.data) ? data.result.data : null],
          'sectionId',
          'section_id',
          'id'
        )
      ),
  }),
  'PUT /sections/:id': makeRule({
    title: 'Section updated',
    message: (data) => `Section ${String(data.snapshot?.name ?? data.params.id)} was updated.`,
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      ...userRecipients(data.snapshot?.member_ids),
      {
        kind: 'sectionMembers',
        sectionId: asId(data.snapshot?.section_id ?? data.params.id),
      },
      {
        kind: 'departmentMembers',
        departmentId: asId(value(data.body, 'departmentId', 'department_id')),
      },
      userRecipient(data.snapshot?.section_head_id),
      userRecipient(value(data.body, 'sectionHeadId', 'section_head_id')),
    ],
    link: '/dashboard/sections/list',
    entityType: 'section',
    entityId: (data) => asId(data.snapshot?.section_id ?? data.params.id),
    snapshot: snapshotSection,
  }),
  'DELETE /sections/delete/:id': makeRule({
    title: 'Section removed',
    message: (data) => `Section ${String(data.snapshot?.name ?? data.params.id)} was removed.`,
    type: 'warning',
    recipients: (data) => [
      superAdmins(),
      ...userRecipients(data.snapshot?.member_ids),
      userRecipient(data.snapshot?.section_head_id),
      userRecipient(data.snapshot?.department_head_id),
    ],
    link: '/dashboard/sections/list',
    entityType: 'section',
    entityId: (data) => asId(data.snapshot?.section_id ?? data.params.id),
    snapshot: snapshotSection,
  }),
  'POST /groups/create': makeRule({
    title: 'Group created',
    message: (data) => {
      const name = value(data.body, 'group_name', 'groupName')
      return typeof name === 'string' && name.trim()
        ? `Group ${name.trim()} was created.`
        : 'A group was created.'
    },
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      groupMembers(value(data.body, 'member_ids', 'memberIds')),
    ],
    link: '/dashboard/groups/list',
    entityType: 'group',
    entityId: (data) =>
      asId(
        firstValue(
          [data.result, isRecord(data.result?.data) ? data.result.data : null],
          'group_id',
          'groupId',
          'id'
        )
      ),
  }),
  'PUT /groups/:id': makeRule({
    title: 'Group updated',
    message: (data) => `Group ${String(data.snapshot?.group_name ?? data.params.id)} was updated.`,
    type: 'success',
    recipients: (data) => [
      superAdmins(),
      groupMembers(data.snapshot?.member_ids),
      groupMembers(value(data.body, 'member_ids', 'memberIds')),
      { kind: 'groupMembers', groupId: data.params.id },
    ],
    link: '/dashboard/groups/list',
    entityType: 'group',
    entityId: (data) => asId(data.snapshot?.group_id ?? data.params.id),
    snapshot: snapshotGroup,
  }),
  'DELETE /groups/:id': makeRule({
    title: 'Group removed',
    message: (data) => `Group ${String(data.snapshot?.group_name ?? data.params.id)} was removed.`,
    type: 'warning',
    recipients: (data) => [superAdmins(), groupMembers(data.snapshot?.member_ids)],
    link: '/dashboard/groups/list',
    entityType: 'group',
    entityId: (data) => asId(data.snapshot?.group_id ?? data.params.id),
    snapshot: snapshotGroup,
  }),
  'POST /overview/update': makeRule({
    title: 'Overview content updated',
    message: () => 'Overview content was updated.',
    type: 'success',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'overview',
  }),
  'PATCH /overview/:id': makeRule({
    title: 'Overview content updated',
    message: () => 'Overview content was updated.',
    type: 'success',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'overview',
    entityId: (data) => asId(data.params.id),
  }),
  'DELETE /overview/:id': makeRule({
    title: 'Overview content removed',
    message: () => 'Overview content was removed.',
    type: 'warning',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'overview',
    entityId: (data) => asId(data.params.id),
    snapshot: async (ctx) => {
      const image = await db
        .from('overview_images')
        .where('id', ctx.params.id)
        .select('id', 'section', 'title')
        .first()
      return image ?? null
    },
  }),
  'POST /quotes': makeRule({
    title: 'Quote created',
    message: () => 'A quote was created.',
    type: 'success',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'quote',
    entityId: (data) => asId(resultValue(data, 'id')),
  }),
  'PUT /quotes/:id': makeRule({
    title: 'Quote updated',
    message: () => 'A quote was updated.',
    type: 'success',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'quote',
    entityId: (data) => asId(data.params.id),
  }),
  'DELETE /quotes/:id': makeRule({
    title: 'Quote removed',
    message: (data) => `Quote ${String(data.snapshot?.title ?? data.params.id)} was removed.`,
    type: 'warning',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'quote',
    entityId: (data) => asId(data.snapshot?.id ?? data.params.id),
    snapshot: snapshotQuote,
  }),
  'POST /daily-darshan': makeRule({
    title: 'Daily darshan created',
    message: () => 'A daily darshan entry was created.',
    type: 'success',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'daily_darshan',
    entityId: (data) => asId(resultValue(data, 'id')),
  }),
  'PUT /daily-darshan/:id': makeRule({
    title: 'Daily darshan updated',
    message: (data) =>
      `Daily darshan ${String(data.snapshot?.title ?? data.params.id)} was updated.`,
    type: 'success',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'daily_darshan',
    entityId: (data) => asId(data.params.id),
    snapshot: snapshotDailyDarshan,
  }),
  'DELETE /daily-darshan/:id': makeRule({
    title: 'Daily darshan removed',
    message: (data) =>
      `Daily darshan ${String(data.snapshot?.title ?? data.params.id)} was removed.`,
    type: 'warning',
    recipients: () => [superAdmins()],
    link: '/dashboard',
    entityType: 'daily_darshan',
    entityId: (data) => asId(data.snapshot?.id ?? data.params.id),
    snapshot: snapshotDailyDarshan,
  }),
  'POST /upload/avatar': makeRule({
    title: 'Avatar uploaded',
    message: (data) => `${data.actor.name} uploaded an avatar image.`,
    recipients: () => [superAdmins()],
    link: '/dashboard/users/list',
    entityType: 'upload',
  }),
  'POST /upload/section': makeRule({
    title: 'Section image uploaded',
    message: (data) => `${data.actor.name} uploaded a section image.`,
    recipients: () => [superAdmins()],
    link: '/dashboard/sections/list',
    entityType: 'upload',
  }),
  'POST /lessons/create': makeRule({
    title: 'New lesson added',
    message: (data) => {
      const lessonData = isRecord(data.result?.data) ? data.result.data : data.result
      const title = value(lessonData, 'lesson_title', 'lessonTitle')
      return typeof title === 'string' && title.trim()
        ? `A new lesson, ${title.trim()}, is available.`
        : 'A new lesson is available.'
    },
    type: 'success',
    recipients: (data) => {
      const lessonId = asId(resultValue(data, 'lesson_id', 'lessonId'))
      return [superAdmins(), ...(lessonId ? [{ kind: 'lessonAudience' as const, lessonId }] : [])]
    },
    link: (_data, recipient) =>
      recipient.kind === 'superAdmins'
        ? '/dashboard/lessons/list'
        : '/dashboard/lessons/my-lessons',
    entityType: 'lesson',
    entityId: (data) => asId(resultValue(data, 'lesson_id', 'lessonId')),
  }),
  'DELETE /lessons/delete/:id': makeRule({
    title: 'Lesson removed',
    message: (data) =>
      `Lesson ${String(data.snapshot?.lesson_title ?? data.params.id)} was removed.`,
    type: 'warning',
    recipients: (data) => [
      superAdmins(),
      ...(data.snapshot
        ? [
            {
              kind: 'lessonAudience' as const,
              lesson: {
                lesson_id: asId(data.snapshot.lesson_id),
                created_by: asId(data.snapshot.created_by),
                assign_scope:
                  typeof data.snapshot.assign_scope === 'string'
                    ? data.snapshot.assign_scope
                    : undefined,
                assign_department_id: asId(data.snapshot.assign_department_id),
                assign_section_id: asId(data.snapshot.assign_section_id),
                assign_student_id: asId(data.snapshot.assign_student_id),
                assign_group_id: asId(data.snapshot.assign_group_id),
                assign_head_only: data.snapshot.assign_head_only === true,
              },
            },
          ]
        : []),
    ],
    link: (_data, recipient) =>
      recipient.kind === 'superAdmins'
        ? '/dashboard/lessons/list'
        : '/dashboard/lessons/my-lessons',
    entityType: 'lesson',
    entityId: (data) => asId(data.snapshot?.lesson_id ?? data.params.id),
    snapshot: snapshotLesson,
  }),
}

export function createDefaultRouteRule(routeKey: string): RouteNotificationRule {
  return makeRule({
    title: 'System activity',
    message: (data) => `${data.actor.name} performed ${data.method} ${routeKey}.`,
    recipients: () => [superAdmins()],
    link: '/dashboard',
  })
}
