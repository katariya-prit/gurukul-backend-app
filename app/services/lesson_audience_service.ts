import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

type IdValue = string | number | bigint | null | undefined

export interface LessonAudienceRecord {
  lessonId?: IdValue
  lesson_id?: IdValue
  createdBy?: IdValue
  created_by?: IdValue
  assignScope?: string
  assign_scope?: string
  assignDepartmentId?: IdValue
  assign_department_id?: IdValue
  assignSectionId?: IdValue
  assign_section_id?: IdValue
  assignStudentId?: IdValue
  assign_student_id?: IdValue
  assignGroupId?: IdValue
  assign_group_id?: IdValue
  assignHeadOnly?: boolean | null
  assign_head_only?: boolean | null
}

function getId(
  record: LessonAudienceRecord,
  camelKey: keyof LessonAudienceRecord,
  snakeKey: keyof LessonAudienceRecord
) {
  const value = record[camelKey] ?? record[snakeKey]
  return value === null || value === undefined ? null : String(value)
}

export async function resolveLessonAudience(lesson: LessonAudienceRecord): Promise<number[]> {
  const scope = lesson.assignScope ?? lesson.assign_scope
  const creatorId = getId(lesson, 'createdBy', 'created_by')
  const query = User.query().where('status', 'APPROVED')

  if (creatorId) {
    query.whereNot('suid', creatorId)
  }

  if (scope === 'all') {
    query.whereNot('roleCode', 'SUPER_ADMIN')
  } else if (scope === 'department') {
    const departmentId = getId(lesson, 'assignDepartmentId', 'assign_department_id')
    if (!departmentId) return []
    query.where('departmentId', departmentId)
  } else if (scope === 'section') {
    const sectionId = getId(lesson, 'assignSectionId', 'assign_section_id')
    if (!sectionId) return []
    query.where('sectionId', sectionId)
  } else if (scope === 'student') {
    const studentId = getId(lesson, 'assignStudentId', 'assign_student_id')
    if (!studentId) return []
    query.where('suid', studentId)
  } else if (scope === 'group') {
    const groupId = getId(lesson, 'assignGroupId', 'assign_group_id')
    if (!groupId) return []
    const group = await db.from('groups').where('group_id', groupId).select('member_ids').first()
    const memberIds: unknown = group?.member_ids
    if (!Array.isArray(memberIds) || memberIds.length === 0) return []
    const ids = memberIds.filter(
      (id): id is string | number | bigint =>
        typeof id === 'string' || typeof id === 'number' || typeof id === 'bigint'
    )
    if (ids.length === 0) return []
    query.whereIn('suid', ids.map(String))
  } else {
    return []
  }

  if (lesson.assignHeadOnly ?? lesson.assign_head_only) {
    query.whereIn('roleCode', ['HEAD100', 'SECHEAD101'])
  }

  const users = await query.select('suid')
  return users
    .map(({ suid }) => Number(suid))
    .filter((suid) => Number.isSafeInteger(suid) && suid > 0)
}
