import db from '@adonisjs/lucid/services/db'
import Department from '#models/department'
import Functionality from '#models/functionality'
import DepartmentFunctionality from '#models/department_functionality'
import { functionalityCache } from '#services/functionality_cache_service'

export interface DepartmentFunctionalityRow {
  functionalityId: number
  name: string
  key: string
  icon: string | null
  themeColor: string | null
  evaluatorType: 'ai' | 'teacher' | 'both'
  functionalityIsActive: boolean
  isEnabled: boolean
  itemLabel: string
}

export interface SyncPayloadItem {
  functionalityId: number
  isEnabled: boolean
  itemLabel?: string
}

export class NotFoundError extends Error {
  status = 404
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  status = 422
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export default class DepartmentFunctionalityService {
  async listForDepartment(departmentId: number): Promise<DepartmentFunctionalityRow[]> {
    const department = await Department.find(departmentId)
    if (!department) {
      throw new NotFoundError('Department not found.')
    }

    const rows = await db.rawQuery<{ rows: Array<Record<string, unknown>> }>(
      `
        SELECT
          f.id               AS functionality_id,
          f.name             AS name,
          f.key              AS key,
          f.icon             AS icon,
          f.theme_color      AS theme_color,
          f.evaluator_type   AS evaluator_type,
          f.is_active        AS functionality_is_active,
          COALESCE(df.is_enabled, false) AS is_enabled,
          COALESCE(df.item_label, 'Item') AS item_label
        FROM department_functionalities df
        JOIN functionalities f ON f.id = df.functionality_id
        WHERE df.department_id = :departmentId
        ORDER BY f.name ASC
      `,
      { departmentId }
    )

    return rows.rows.map((r) => ({
      functionalityId: Number(r.functionality_id),
      name: String(r.name),
      key: String(r.key),
      icon: r.icon ? String(r.icon) : null,
      themeColor: r.theme_color ? String(r.theme_color) : null,
      evaluatorType: String(r.evaluator_type) as 'ai' | 'teacher' | 'both',
      functionalityIsActive: Boolean(r.functionality_is_active),
      isEnabled: Boolean(r.is_enabled),
      itemLabel: String(r.item_label),
    }))
  }

  async sync(
    departmentId: number,
    payload: SyncPayloadItem[]
  ): Promise<{ data: DepartmentFunctionalityRow[]; enabledCount: number }> {
    const department = await Department.find(departmentId)
    if (!department) {
      throw new NotFoundError('Department not found.')
    }

    if (payload.length === 0) {
      const data = await this.listForDepartment(departmentId)
      return { data, enabledCount: data.filter((r) => r.isEnabled).length }
    }

    const funcIds = payload.map((p) => p.functionalityId)

    const existingFuncs = await Functionality.query().whereIn('id', funcIds)
    const existingMap = new Map<number, Functionality>()
    for (const f of existingFuncs) {
      existingMap.set(f.id, f)
    }

    const unknownIds = funcIds.filter((id) => !existingMap.has(id))
    if (unknownIds.length > 0) {
      throw new ValidationError(`Unknown functionality IDs: ${unknownIds.join(', ')}`)
    }

    const currentAssignments = await DepartmentFunctionality.query()
      .where('department_id', departmentId)
      .whereIn('functionality_id', funcIds)

    const currentEnabledSet = new Set<number>()
    for (const a of currentAssignments) {
      if (a.isEnabled) {
        currentEnabledSet.add(a.functionalityId)
      }
    }

    for (const item of payload) {
      if (item.isEnabled) {
        const func = existingMap.get(item.functionalityId)!
        if (!func.isActive && !currentEnabledSet.has(item.functionalityId)) {
          throw new ValidationError(
            `Functionality "${func.name}" is inactive and cannot be newly enabled.`
          )
        }
      }
    }

    await db.transaction(async (trx) => {
      for (const item of payload) {
        const resolvedLabel = item.isEnabled
          ? (item.itemLabel?.trim() || 'Item')
          : (item.itemLabel?.trim() || 'Item')

        await trx.rawQuery(
          `
            INSERT INTO department_functionalities
              (department_id, functionality_id, item_label, is_enabled)
            VALUES
              (:departmentId, :functionalityId, :itemLabel, :isEnabled)
            ON CONFLICT (department_id, functionality_id)
            DO UPDATE SET
              item_label = EXCLUDED.item_label,
              is_enabled  = EXCLUDED.is_enabled,
              updated_at  = now()
          `,
          {
            departmentId,
            functionalityId: item.functionalityId,
            itemLabel: resolvedLabel,
            isEnabled: item.isEnabled,
          }
        )
      }
    })

    functionalityCache.invalidate()

    const data = await this.listForDepartment(departmentId)
    return { data, enabledCount: data.filter((r) => r.isEnabled).length }
  }

  async getEnabledForDepartment(
    departmentId: number
  ): Promise<Array<{ functionalityId: number; name: string; itemLabel: string }>> {
    const rows = await db.rawQuery<{ rows: Array<Record<string, unknown>> }>(
      `
        SELECT
          df.functionality_id,
          f.name,
          df.item_label
        FROM department_functionalities df
        JOIN functionalities f ON f.id = df.functionality_id
        WHERE df.department_id = :departmentId
          AND df.is_enabled = true
        ORDER BY f.name ASC
      `,
      { departmentId }
    )

    return rows.rows.map((r) => ({
      functionalityId: Number(r.functionality_id),
      name: String(r.name),
      itemLabel: String(r.item_label),
    }))
  }

  async getEnabledCountForDepartments(
    departmentIds: number[]
  ): Promise<Map<number, { count: number; items: Array<{ functionalityId: number; name: string; itemLabel: string }> }>> {
    if (departmentIds.length === 0) {
      return new Map()
    }

    const rows = await db.rawQuery<{ rows: Array<Record<string, unknown>> }>(
      `
        SELECT
          df.department_id,
          df.functionality_id,
          f.name,
          df.item_label
        FROM department_functionalities df
        JOIN functionalities f ON f.id = df.functionality_id
        WHERE df.department_id = ANY(:departmentIds)
          AND df.is_enabled = true
        ORDER BY f.name ASC
      `,
      { departmentIds }
    )

    const result = new Map<number, { count: number; items: Array<{ functionalityId: number; name: string; itemLabel: string }> }>()

    for (const r of rows.rows) {
      const deptId = Number(r.department_id)
      if (!result.has(deptId)) {
        result.set(deptId, { count: 0, items: [] })
      }
      const entry = result.get(deptId)!
      entry.items.push({
        functionalityId: Number(r.functionality_id),
        name: String(r.name),
        itemLabel: String(r.item_label),
      })
      entry.count += 1
    }

    return result
  }
}
