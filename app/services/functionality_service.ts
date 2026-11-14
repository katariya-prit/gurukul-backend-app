import db from '@adonisjs/lucid/services/db'
import Functionality from '#models/functionality'
import Department from '#models/department'
import DepartmentFunctionality from '#models/department_functionality'
import { functionalityCache } from '#services/functionality_cache_service'

export interface FunctionalityFilter {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean | string
  all?: boolean | string
}

export interface FunctionalityDto {
  id: number
  key: string
  name: string
  description: string | null
  icon: string | null
  themeColor: string | null
  evaluatorType: 'ai' | 'teacher' | 'both'
  isActive: boolean
  departmentCount: number
  itemCount: number
}

export default class FunctionalityService {
  async list(filters: FunctionalityFilter = {}) {
    const isAll = filters.all === true || filters.all === 'true'
    const page = Number(filters.page || 1)
    const limit = Math.min(Number(filters.limit || 20), 100)
    const search = filters.search?.trim()
    const isActiveFilter = filters.isActive !== undefined ? String(filters.isActive) === 'true' : null

    const query = Functionality.query()

    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`).orWhereILike('key', `%${search}%`)
      })
    }

    if (isActiveFilter !== null) {
      query.where('is_active', isActiveFilter)
    }

    if (isAll) {
      query.orderBy('name', 'asc')
      const records = await query
      return {
        data: records.map((r) => ({
          id: r.id,
          key: r.key,
          name: r.name,
          icon: r.icon,
          themeColor: r.themeColor,
          evaluatorType: r.evaluatorType,
          isActive: r.isActive,
        })),
      }
    }

    query.orderBy('id', 'asc')

    const paginated = await query.paginate(page, limit)
    const records = paginated.all()
    const formatted = await this.enrichCounts(records)

    return {
      data: formatted,
      meta: {
        page: paginated.currentPage,
        limit: paginated.perPage,
        total: paginated.total,
        totalPages: paginated.lastPage,
      },
    }
  }

  private async enrichCounts(records: Functionality[]): Promise<FunctionalityDto[]> {
    if (records.length === 0) {
      return []
    }

    const ids = records.map((r) => r.id)

    const deptCountsResult = await db.rawQuery(
      `
        SELECT functionality_id, count(*)::int AS count
        FROM department_functionalities
        WHERE functionality_id = ANY(:ids) AND is_enabled = true
        GROUP BY functionality_id
      `,
      { ids }
    )

    const itemCountsResult = await db.rawQuery(
      `
        SELECT functionality_id, count(*)::int AS count
        FROM functionality_items
        WHERE functionality_id = ANY(:ids) AND is_active = true
        GROUP BY functionality_id
      `,
      { ids }
    )

    const deptMap = new Map<number, number>()
    for (const row of deptCountsResult.rows) {
      deptMap.set(Number(row.functionality_id), Number(row.count))
    }

    const itemMap = new Map<number, number>()
    for (const row of itemCountsResult.rows) {
      itemMap.set(Number(row.functionality_id), Number(row.count))
    }

    return records.map((r) => ({
      id: r.id,
      key: r.key,
      name: r.name,
      description: r.description,
      icon: r.icon,
      themeColor: r.themeColor,
      evaluatorType: r.evaluatorType,
      isActive: r.isActive,
      departmentCount: deptMap.get(r.id) ?? 0,
      itemCount: itemMap.get(r.id) ?? 0,
    }))
  }

  async getById(id: number): Promise<FunctionalityDto | null> {
    const functionality = await Functionality.find(id)
    if (!functionality) {
      return null
    }

    const enriched = await this.enrichCounts([functionality])
    return enriched[0] ?? null
  }

  async create(payload: {
    name: string
    key: string
    description?: string | null
    icon?: string | null
    themeColor?: string | null
    evaluatorType: 'ai' | 'teacher' | 'both'
    isActive?: boolean
  }): Promise<FunctionalityDto> {
    const functionality = await Functionality.create({
      name: payload.name,
      key: payload.key,
      description: payload.description ?? null,
      icon: payload.icon ?? null,
      themeColor: payload.themeColor ?? null,
      evaluatorType: payload.evaluatorType,
      isActive: payload.isActive ?? true,
    })

    functionalityCache.invalidate()
    const enriched = await this.enrichCounts([functionality])
    return enriched[0]
  }

  async update(
    id: number,
    payload: {
      name?: string
      key?: string
      description?: string | null
      icon?: string | null
      themeColor?: string | null
      evaluatorType?: 'ai' | 'teacher' | 'both'
      isActive?: boolean
    }
  ): Promise<FunctionalityDto | null> {
    const functionality = await Functionality.find(id)
    if (!functionality) {
      return null
    }

    if (payload.name !== undefined) functionality.name = payload.name
    if (payload.key !== undefined) functionality.key = payload.key
    if (payload.description !== undefined) functionality.description = payload.description
    if (payload.icon !== undefined) functionality.icon = payload.icon
    if (payload.themeColor !== undefined) functionality.themeColor = payload.themeColor
    if (payload.evaluatorType !== undefined) functionality.evaluatorType = payload.evaluatorType
    if (payload.isActive !== undefined) functionality.isActive = payload.isActive

    await functionality.save()
    functionalityCache.invalidate()

    const enriched = await this.enrichCounts([functionality])
    return enriched[0] ?? null
  }

  async setActive(id: number, isActive: boolean): Promise<FunctionalityDto | null> {
    return this.update(id, { isActive })
  }

  async softDelete(id: number): Promise<boolean> {
    const updated = await this.update(id, { isActive: false })
    return updated !== null
  }

  async getDepartments(functionalityId: number) {
    const departments = await Department.query().orderBy('department_name', 'asc')
    const assignments = await DepartmentFunctionality.query().where('functionality_id', functionalityId)

    const assignmentMap = new Map<number, DepartmentFunctionality>()
    for (const a of assignments) {
      assignmentMap.set(a.departmentId, a)
    }

    return departments.map((dept) => {
      const assignment = assignmentMap.get(dept.departmentId)
      return {
        id: assignment?.id ?? 0,
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        functionalityId,
        itemLabel: assignment?.itemLabel ?? 'Item',
        isEnabled: assignment?.isEnabled ?? false,
      }
    })
  }

  async updateDepartments(
    functionalityId: number,
    assignments: Array<{ departmentId: number; itemLabel?: string; isEnabled: boolean }>
  ) {
    await db.transaction(async (trx) => {
      for (const item of assignments) {
        const itemLabel = item.itemLabel?.trim() || 'Item'
        await trx.rawQuery(
          `
            INSERT INTO department_functionalities (department_id, functionality_id, item_label, is_enabled)
            VALUES (:departmentId, :functionalityId, :itemLabel, :isEnabled)
            ON CONFLICT (department_id, functionality_id)
            DO UPDATE SET
              item_label = EXCLUDED.item_label,
              is_enabled = EXCLUDED.is_enabled
          `,
          {
            departmentId: item.departmentId,
            functionalityId,
            itemLabel,
            isEnabled: item.isEnabled,
          }
        )
      }
    })

    functionalityCache.invalidate()
    return this.getDepartments(functionalityId)
  }

  async getForDepartment(departmentId: number) {
    const functionalities = await Functionality.query().where('is_active', true).orderBy('name', 'asc')
    const assignments = await DepartmentFunctionality.query().where('department_id', departmentId)

    const assignmentMap = new Map<number, DepartmentFunctionality>()
    for (const a of assignments) {
      assignmentMap.set(a.functionalityId, a)
    }

    return functionalities.map((f) => {
      const assignment = assignmentMap.get(f.id)
      return {
        id: assignment?.id ?? 0,
        functionalityId: f.id,
        functionalityName: f.name,
        departmentId,
        itemLabel: assignment?.itemLabel ?? 'Item',
        isEnabled: assignment?.isEnabled ?? false,
      }
    })
  }

  async updateForDepartment(
    departmentId: number,
    functionalities: Array<{ functionalityId: number; itemLabel?: string; isEnabled: boolean }>
  ) {
    await db.transaction(async (trx) => {
      for (const item of functionalities) {
        const itemLabel = item.itemLabel?.trim() || 'Item'
        await trx.rawQuery(
          `
            INSERT INTO department_functionalities (department_id, functionality_id, item_label, is_enabled)
            VALUES (:departmentId, :functionalityId, :itemLabel, :isEnabled)
            ON CONFLICT (department_id, functionality_id)
            DO UPDATE SET
              item_label = EXCLUDED.item_label,
              is_enabled = EXCLUDED.is_enabled
          `,
          {
            departmentId,
            functionalityId: item.functionalityId,
            itemLabel,
            isEnabled: item.isEnabled,
          }
        )
      }
    })

    functionalityCache.invalidate()
    return this.getForDepartment(departmentId)
  }
}
