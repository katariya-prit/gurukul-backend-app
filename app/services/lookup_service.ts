import db from '@adonisjs/lucid/services/db'
import Department from '#models/department'
import Section from '#models/section'
import Role from '#models/role'
import User from '#models/user'
import Functionality from '#models/functionality'
import { functionalityCache } from '#services/functionality_cache_service'

export interface LookupOption {
  id: number | string
  name: string
}

export default class LookupService {
  async getDepartments(): Promise<LookupOption[]> {
    const departments = await Department.query().orderBy('department_name', 'asc')
    return departments.map((d) => ({
      id: d.departmentId,
      name: d.departmentName,
    }))
  }

  async getSections(departmentId?: number): Promise<Array<{ id: number; name: string; departmentId: number }>> {
    const query = Section.query().orderBy('name', 'asc')
    if (departmentId) {
      query.where('department_id', departmentId)
    }
    const sections = await query
    return sections.map((s) => ({
      id: s.sectionId,
      name: s.name,
      departmentId: s.departmentId,
    }))
  }

  async getRoles(): Promise<Array<{ id: string; name: string }>> {
    const roles = await Role.query().orderBy('role_code', 'asc')
    return roles.map((r) => ({
      id: r.roleCode,
      name: r.roleName,
    }))
  }

  async getUsers(search?: string, limit: number = 20): Promise<Array<{ id: number; name: string; username: string }>> {
    const query = User.query().where('status', 'APPROVED').orderBy('name', 'asc').limit(limit)
    if (search?.trim()) {
      query.where((q) => {
        q.whereILike('name', `%${search.trim()}%`).orWhereILike('username', `%${search.trim()}%`)
      })
    }
    const users = await query
    return users.map((u) => ({
      id: Number(u.suid),
      name: u.name,
      username: u.username,
    }))
  }

  async getNavigation(user: User) {
    const cacheKey = `navigation_user_${user.roleCode}_${user.suid}`
    const cached = functionalityCache.get(cacheKey)
    if (cached) {
      return cached
    }

    if (user.roleCode === 'SUPER_ADMIN') {
      const functionalities = await Functionality.query().where('is_active', true).orderBy('name', 'asc')
      const result = {
        functionalities: functionalities.map((f) => ({
          id: f.id,
          key: f.key,
          name: f.name,
          icon: f.icon,
        })),
      }
      functionalityCache.set(cacheKey, result, 60 * 1000)
      return result
    }

    if (user.roleCode === 'HEAD100' && user.departmentId) {
      const rows = await db.rawQuery(
        `
          SELECT f.id, f.key, f.name, f.icon, df.item_label AS "itemLabel"
          FROM functionalities f
          INNER JOIN department_functionalities df
            ON df.functionality_id = f.id AND df.department_id = :departmentId
          WHERE f.is_active = true AND df.is_enabled = true
          ORDER BY f.name ASC
        `,
        { departmentId: user.departmentId }
      )
      const result = {
        functionalities: rows.rows.map((r: Record<string, unknown>) => ({
          id: Number(r.id),
          key: String(r.key),
          name: String(r.name),
          icon: r.icon ? String(r.icon) : null,
          itemLabel: String(r.itemLabel || 'Item'),
        })),
      }
      functionalityCache.set(cacheKey, result, 60 * 1000)
      return result
    }

    const emptyResult = { functionalities: [] }
    functionalityCache.set(cacheKey, emptyResult, 60 * 1000)
    return emptyResult
  }

  async getMyItems(user: User) {
    if (user.roleCode === 'STUDENT') {
      const rows = await db.rawQuery(
        `
          SELECT
            fi.id,
            fi.name,
            fi.icon,
            fi.functionality_id AS "functionalityId",
            f.name AS "functionalityName",
            si.current_level_no AS "currentLevelNo",
            COALESCE(il.name, 'Level ' || si.current_level_no) AS "currentLevelName",
            si.total_points AS "totalPoints"
          FROM student_items si
          INNER JOIN functionality_items fi ON fi.id = si.item_id
          INNER JOIN functionalities f ON f.id = fi.functionality_id
          LEFT JOIN item_levels il ON il.item_id = fi.id AND il.level_no = si.current_level_no
          WHERE si.student_suid = :suid AND fi.is_active = true
          ORDER BY fi.name ASC
        `,
        { suid: user.suid }
      )

      return rows.rows.map((r: Record<string, unknown>) => ({
        id: Number(r.id),
        name: String(r.name),
        icon: r.icon ? String(r.icon) : null,
        functionalityId: Number(r.functionalityId),
        functionalityName: String(r.functionalityName),
        currentLevelNo: Number(r.currentLevelNo),
        currentLevelName: String(r.currentLevelName),
        totalPoints: Number(r.totalPoints || 0),
      }))
    }

    return []
  }
}
