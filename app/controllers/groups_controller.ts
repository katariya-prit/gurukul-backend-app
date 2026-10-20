import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { createGroupValidator, updateGroupValidator } from '#validators/group'

async function getMembersForGroup(memberIds: number[]) {
  if (!memberIds || memberIds.length === 0) return []

  const result = await db.rawQuery(
    `SELECT suid, name, role_code, avatar
     FROM users
     WHERE suid = ANY(?::bigint[])
     ORDER BY array_position(?::bigint[], suid)`,
    [memberIds, memberIds]
  )
  return result.rows as any[]
}

async function getCreatedByName(createdBy: number | null) {
  if (!createdBy) return null
  const result = await db.rawQuery(`SELECT name FROM users WHERE suid = ?`, [createdBy])
  return result.rows[0]?.name ?? null
}

export default class GroupsController {
  async index({ response }: HttpContext) {
    try {
      const groupsRes = await db.rawQuery(
        `SELECT group_id, group_name, description, member_ids, created_by, created_at
         FROM groups
         ORDER BY created_at DESC`
      )

      const data = await Promise.all(
        (groupsRes.rows as any[]).map(async (g) => {
          const [members, createdByName] = await Promise.all([
            getMembersForGroup(g.member_ids),
            getCreatedByName(g.created_by),
          ])

          return {
            group_id: g.group_id,
            group_name: g.group_name,
            description: g.description,
            created_by: g.created_by,
            created_by_name: createdByName,
            members,
            created_at: g.created_at,
          }
        })
      )

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Failed to fetch groups',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const groupRes = await db.rawQuery(
        `SELECT group_id, group_name, description, member_ids, created_by, created_at
         FROM groups
         WHERE group_id = ?`,
        [params.id]
      )

      if (groupRes.rows.length === 0) {
        return response.notFound({ success: false, message: 'Group મળ્યું નથી.' })
      }

      const g = groupRes.rows[0]
      const [members, createdByName] = await Promise.all([
        getMembersForGroup(g.member_ids),
        getCreatedByName(g.created_by),
      ])

      const data = {
        group_id: g.group_id,
        group_name: g.group_name,
        description: g.description,
        created_by: g.created_by,
        created_by_name: createdByName,
        members,
        created_at: g.created_at,
      }

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Failed to fetch group',
      })
    }
  }

  async byMember({ params, response }: HttpContext) {
    try {
      const suid = Number(params.suid)

      const groupsRes = await db.rawQuery(
        `SELECT group_id, group_name, description, member_ids, created_by, created_at
         FROM groups
         WHERE ? = ANY(member_ids)
         ORDER BY created_at DESC`,
        [suid]
      )

      const data = (groupsRes.rows as any[]).map((g) => ({
        group_id: g.group_id,
        group_name: g.group_name,
        description: g.description,
        created_by: g.created_by,
        created_at: g.created_at,
        is_leader: Number(g.member_ids[0]) === suid,
      }))

      return response.ok({ success: true, data })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Failed to fetch your groups',
      })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createGroupValidator)
      const createdBy = auth.user!.suid

      const result = await db.rawQuery(
        `INSERT INTO groups (group_name, description, member_ids, created_by, created_at, updated_at)
         VALUES (?, ?, ?::bigint[], ?, NOW(), NOW())
         RETURNING group_id, group_name, description, member_ids, created_by, created_at`,
        [payload.group_name, payload.description ?? null, payload.member_ids, createdBy]
      )

      const g = result.rows[0]
      const members = await getMembersForGroup(g.member_ids)

      return response.created({
        success: true,
        message: 'Group created successfully',
        data: {
          group_id: g.group_id,
          group_name: g.group_name,
          description: g.description,
          created_by: g.created_by,
          members,
          created_at: g.created_at,
        },
      })
    } catch (error: any) {
      if (error.messages) {
        return response.badRequest({ success: false, message: 'Validation failure', errors: error.messages })
      }
      return response.badRequest({
        success: false,
        message: error.message || 'Failed to create group',
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateGroupValidator)

      const existing = await db.rawQuery(`SELECT group_id FROM groups WHERE group_id = ?`, [params.id])
      if (existing.rows.length === 0) {
        return response.notFound({ success: false, message: 'Group મળ્યું નથી.' })
      }

      const fields: string[] = []
      const values: any[] = []

      if (payload.group_name !== undefined) {
        fields.push(`group_name = ?`)
        values.push(payload.group_name)
      }
      if (payload.description !== undefined) {
        fields.push(`description = ?`)
        values.push(payload.description)
      }
      if (payload.member_ids !== undefined) {
        fields.push(`member_ids = ?::bigint[]`)
        values.push(payload.member_ids)
      }
      fields.push(`updated_at = NOW()`)

      values.push(params.id)

      const result = await db.rawQuery(
        `UPDATE groups SET ${fields.join(', ')} WHERE group_id = ?
         RETURNING group_id, group_name, description, member_ids, created_by, created_at`,
        values
      )

      const g = result.rows[0]
      const members = await getMembersForGroup(g.member_ids)

      return response.ok({
        success: true,
        message: 'Group updated successfully',
        data: {
          group_id: g.group_id,
          group_name: g.group_name,
          description: g.description,
          created_by: g.created_by,
          members,
          created_at: g.created_at,
        },
      })
    } catch (error: any) {
      if (error.messages) {
        return response.badRequest({ success: false, message: 'Validation failure', errors: error.messages })
      }
      return response.badRequest({
        success: false,
        message: error.message || 'Failed to update group',
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const result = await db.rawQuery(`DELETE FROM groups WHERE group_id = ? RETURNING group_id`, [params.id])
      if (result.rows.length === 0) {
        return response.notFound({ success: false, message: 'Group મળ્યું નથી.' })
      }
      return response.ok({ success: true, message: 'Group deleted successfully' })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Failed to delete group',
      })
    }
  }
}