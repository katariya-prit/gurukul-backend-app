import db from '@adonisjs/lucid/services/db'
import FunctionalityItem from '#models/functionality_item'
import DepartmentFunctionality from '#models/department_functionality'
import { functionalityCache } from '#services/functionality_cache_service'

export interface ItemFilter {
  functionalityId?: number
  departmentId?: number
  search?: string
  isActive?: boolean | string
  page?: number
  limit?: number
  all?: boolean | string
}

export interface ItemDto {
  id: number
  functionalityId: number
  functionalityName: string
  departmentId: number
  departmentName: string
  itemLabel: string
  name: string
  icon: string | null
  isActive: boolean
  currentRubricVersion: number | null
  levelCount: number
}

export interface ItemSummaryDto extends ItemDto {
  rubric: {
    version: number
    criteriaCount: number
    maxPoints: number
  } | null
  levels: {
    count: number
    firstName: string | null
    lastName: string | null
    promoteSummary: 'auto' | 'manual' | 'mixed'
  }
  permissions: {
    roleCount: number
    sectionCount: number
    userCount: number
  }
}

export class ValidationError extends Error {
  status = 422
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export default class ItemService {
  async list(filters: ItemFilter = {}) {
    const isAll = filters.all === true || filters.all === 'true'
    const page = Number(filters.page || 1)
    const limit = Math.min(Number(filters.limit || 20), 100)
    const search = filters.search?.trim()
    const isActiveFilter = filters.isActive !== undefined ? String(filters.isActive) === 'true' : null

    const baseSql = `
      SELECT
        fi.id,
        fi.functionality_id AS "functionalityId",
        f.name AS "functionalityName",
        fi.department_id AS "departmentId",
        d.department_name AS "departmentName",
        COALESCE(df.item_label, 'Item') AS "itemLabel",
        fi.name,
        fi.icon,
        fi.is_active AS "isActive",
        (SELECT ir.version FROM item_rubrics ir WHERE ir.item_id = fi.id AND ir.is_current = true LIMIT 1) AS "currentRubricVersion",
        (SELECT count(*)::int FROM item_levels il WHERE il.item_id = fi.id) AS "levelCount"
      FROM functionality_items fi
      INNER JOIN functionalities f ON f.id = fi.functionality_id
      INNER JOIN departments d ON d.department_id = fi.department_id
      LEFT JOIN department_functionalities df
        ON df.department_id = fi.department_id AND df.functionality_id = fi.functionality_id
      WHERE 1=1
    `

    const bindings: Record<string, unknown> = {}
    let whereClause = ''

    if (filters.functionalityId) {
      whereClause += ' AND fi.functionality_id = :functionalityId'
      bindings.functionalityId = Number(filters.functionalityId)
    }

    if (filters.departmentId) {
      whereClause += ' AND fi.department_id = :departmentId'
      bindings.departmentId = Number(filters.departmentId)
    }

    if (search) {
      whereClause += ' AND (fi.name ILIKE :search OR f.name ILIKE :search OR d.department_name ILIKE :search)'
      bindings.search = `%${search}%`
    }

    if (isActiveFilter !== null) {
      whereClause += ' AND fi.is_active = :isActive'
      bindings.isActive = isActiveFilter
    }

    const countResult = await db.rawQuery(
      `SELECT count(*)::int AS total FROM functionality_items fi
       INNER JOIN functionalities f ON f.id = fi.functionality_id
       INNER JOIN departments d ON d.department_id = fi.department_id
       WHERE 1=1 ${whereClause}`,
      bindings
    )
    const total = Number(countResult.rows[0]?.total ?? 0)

    let finalSql = `${baseSql} ${whereClause} ORDER BY fi.id ASC`

    if (!isAll) {
      finalSql += ' LIMIT :limit OFFSET :offset'
      bindings.limit = limit
      bindings.offset = (page - 1) * limit
    }

    const rowsResult = await db.rawQuery(finalSql, bindings)
    const data: ItemDto[] = rowsResult.rows.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      functionalityId: Number(row.functionalityId),
      functionalityName: String(row.functionalityName),
      departmentId: Number(row.departmentId),
      departmentName: String(row.departmentName),
      itemLabel: String(row.itemLabel || 'Item'),
      name: String(row.name),
      icon: row.icon ? String(row.icon) : null,
      isActive: Boolean(row.isActive),
      currentRubricVersion: row.currentRubricVersion !== null ? Number(row.currentRubricVersion) : null,
      levelCount: Number(row.levelCount || 0),
    }))

    if (isAll) {
      return { data }
    }

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }

  async getSummaries(filters: ItemFilter = {}) {
    const isAll = filters.all === true || filters.all === 'true'
    const page = Number(filters.page || 1)
    const limit = Math.min(Number(filters.limit || 20), 100)
    const search = filters.search?.trim()
    const isActiveFilter = filters.isActive !== undefined ? String(filters.isActive) === 'true' : null

    const baseSql = `
      SELECT
        fi.id,
        fi.functionality_id AS "functionalityId",
        f.name AS "functionalityName",
        fi.department_id AS "departmentId",
        d.department_name AS "departmentName",
        COALESCE(df.item_label, 'Item') AS "itemLabel",
        fi.name,
        fi.icon,
        fi.is_active AS "isActive",
        rubric_info.version AS "rubricVersion",
        rubric_info.criteria_count AS "criteriaCount",
        rubric_info.max_points AS "rubricMaxPoints",
        levels_info.level_count AS "levelCount",
        levels_info.first_name AS "firstLevelName",
        levels_info.last_name AS "lastLevelName",
        levels_info.promote_summary AS "promoteSummary",
        perms_info.role_count AS "roleCount",
        perms_info.section_count AS "sectionCount",
        perms_info.user_count AS "userCount"
      FROM functionality_items fi
      INNER JOIN functionalities f ON f.id = fi.functionality_id
      INNER JOIN departments d ON d.department_id = fi.department_id
      LEFT JOIN department_functionalities df
        ON df.department_id = fi.department_id AND df.functionality_id = fi.functionality_id
      LEFT JOIN LATERAL (
        SELECT
          ir.version,
          jsonb_array_length(ir.criteria)::int AS criteria_count,
          ir.max_points
        FROM item_rubrics ir
        WHERE ir.item_id = fi.id AND ir.is_current = true
        LIMIT 1
      ) rubric_info ON true
      LEFT JOIN LATERAL (
        SELECT
          count(*)::int AS level_count,
          (SELECT name FROM item_levels WHERE item_id = fi.id ORDER BY level_no ASC LIMIT 1) AS first_name,
          (SELECT name FROM item_levels WHERE item_id = fi.id ORDER BY level_no DESC LIMIT 1) AS last_name,
          CASE
            WHEN count(DISTINCT promote_mode) > 1 THEN 'mixed'
            WHEN min(promote_mode) = 'manual' THEN 'manual'
            ELSE 'auto'
          END AS promote_summary
        FROM item_levels
        WHERE item_id = fi.id
      ) levels_info ON true
      LEFT JOIN LATERAL (
        SELECT
          count(role_code)::int AS role_count,
          count(section_id)::int AS section_count,
          count(user_suid)::int AS user_count
        FROM item_permissions
        WHERE item_id = fi.id
      ) perms_info ON true
      WHERE 1=1
    `

    const bindings: Record<string, unknown> = {}
    let whereClause = ''

    if (filters.functionalityId) {
      whereClause += ' AND fi.functionality_id = :functionalityId'
      bindings.functionalityId = Number(filters.functionalityId)
    }

    if (filters.departmentId) {
      whereClause += ' AND fi.department_id = :departmentId'
      bindings.departmentId = Number(filters.departmentId)
    }

    if (search) {
      whereClause += ' AND (fi.name ILIKE :search OR f.name ILIKE :search OR d.department_name ILIKE :search)'
      bindings.search = `%${search}%`
    }

    if (isActiveFilter !== null) {
      whereClause += ' AND fi.is_active = :isActive'
      bindings.isActive = isActiveFilter
    }

    const countResult = await db.rawQuery(
      `SELECT count(*)::int AS total FROM functionality_items fi
       INNER JOIN functionalities f ON f.id = fi.functionality_id
       INNER JOIN departments d ON d.department_id = fi.department_id
       WHERE 1=1 ${whereClause}`,
      bindings
    )
    const total = Number(countResult.rows[0]?.total ?? 0)

    let finalSql = `${baseSql} ${whereClause} ORDER BY fi.id ASC`

    if (!isAll) {
      finalSql += ' LIMIT :limit OFFSET :offset'
      bindings.limit = limit
      bindings.offset = (page - 1) * limit
    }

    const rowsResult = await db.rawQuery(finalSql, bindings)
    const data: ItemSummaryDto[] = rowsResult.rows.map((row: Record<string, unknown>) => {
      const rubric =
        row.rubricVersion !== null
          ? {
              version: Number(row.rubricVersion),
              criteriaCount: Number(row.criteriaCount || 0),
              maxPoints: Number(row.rubricMaxPoints || 0),
            }
          : null

      return {
        id: Number(row.id),
        functionalityId: Number(row.functionalityId),
        functionalityName: String(row.functionalityName),
        departmentId: Number(row.departmentId),
        departmentName: String(row.departmentName),
        itemLabel: String(row.itemLabel || 'Item'),
        name: String(row.name),
        icon: row.icon ? String(row.icon) : null,
        isActive: Boolean(row.isActive),
        currentRubricVersion: rubric?.version ?? null,
        levelCount: Number(row.levelCount || 0),
        rubric,
        levels: {
          count: Number(row.levelCount || 0),
          firstName: row.firstLevelName ? String(row.firstLevelName) : null,
          lastName: row.lastLevelName ? String(row.lastLevelName) : null,
          promoteSummary: (row.promoteSummary as 'auto' | 'manual' | 'mixed') || 'auto',
        },
        permissions: {
          roleCount: Number(row.roleCount || 0),
          sectionCount: Number(row.sectionCount || 0),
          userCount: Number(row.userCount || 0),
        },
      }
    })

    if (isAll) {
      return { data }
    }

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }

  async getById(id: number): Promise<ItemDto | null> {
    const listRes = await this.list({ all: true })
    return listRes.data.find((item) => item.id === id) ?? null
  }

  async create(payload: {
    functionalityId: number
    departmentId: number
    name: string
    icon?: string | null
    isActive?: boolean
  }): Promise<ItemDto> {
    const assignment = await DepartmentFunctionality.query()
      .where('department_id', payload.departmentId)
      .where('functionality_id', payload.functionalityId)
      .where('is_enabled', true)
      .first()

    if (!assignment) {
      throw new ValidationError('Choose a department enabled for this functionality.')
    }

    const item = await FunctionalityItem.create({
      functionalityId: payload.functionalityId,
      departmentId: payload.departmentId,
      name: payload.name.trim(),
      icon: payload.icon ?? null,
      isActive: payload.isActive ?? true,
    })

    functionalityCache.invalidate()
    const enriched = await this.getById(item.id)
    if (!enriched) {
      throw new Error('Failed to retrieve created item.')
    }

    return enriched
  }

  async update(
    id: number,
    payload: {
      name?: string
      departmentId?: number
      icon?: string | null
      isActive?: boolean
    }
  ): Promise<ItemDto | null> {
    const item = await FunctionalityItem.find(id)
    if (!item) {
      return null
    }

    if (payload.departmentId !== undefined && payload.departmentId !== item.departmentId) {
      const assignment = await DepartmentFunctionality.query()
        .where('department_id', payload.departmentId)
        .where('functionality_id', item.functionalityId)
        .where('is_enabled', true)
        .first()

      if (!assignment) {
        throw new ValidationError('Choose a department enabled for this functionality.')
      }
      item.departmentId = payload.departmentId
    }

    if (payload.name !== undefined) item.name = payload.name.trim()
    if (payload.icon !== undefined) item.icon = payload.icon
    if (payload.isActive !== undefined) item.isActive = payload.isActive

    await item.save()
    functionalityCache.invalidate()

    return this.getById(item.id)
  }

  async setActive(id: number, isActive: boolean): Promise<ItemDto | null> {
    return this.update(id, { isActive })
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await this.update(id, { isActive: false })
    return updated !== null
  }
}
