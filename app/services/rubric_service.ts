import db from '@adonisjs/lucid/services/db'
import ItemRubric, { type RubricCriterion } from '#models/item_rubric'
import FunctionalityItem from '#models/functionality_item'
import { functionalityCache } from '#services/functionality_cache_service'
import { ValidationError } from '#services/item_service'

export interface ItemRubricDto {
  id: number
  itemId: number
  version: number
  criteria: RubricCriterion[]
  maxPoints: number
  isCurrent: boolean
  createdAt: string
  createdBy: string | null
}

export default class RubricService {
  async getVersions(itemId: number): Promise<ItemRubricDto[]> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    const rows = await ItemRubric.query()
      .where('item_id', itemId)
      .preload('creator')
      .orderBy('version', 'desc')

    return rows.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      version: r.version,
      criteria: r.criteria,
      maxPoints: r.maxPoints,
      isCurrent: r.isCurrent,
      createdAt: r.createdAt.toISO() ?? new Date().toISOString(),
      createdBy: r.creator?.name ?? (r.createdBy ? String(r.createdBy) : 'Super Admin'),
    }))
  }

  async getCurrent(itemId: number): Promise<ItemRubricDto | null> {
    const versions = await this.getVersions(itemId)
    return versions.find((v) => v.isCurrent) ?? versions[0] ?? null
  }

  async saveRubric(
    itemId: number,
    criteria: RubricCriterion[],
    userSuid: bigint | null = null,
    maxPointsOverride?: number
  ): Promise<ItemRubricDto> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    const calculatedMaxPoints =
      maxPointsOverride !== undefined
        ? maxPointsOverride
        : criteria.reduce((sum, c) => sum + Number(c.maxPoints || 0), 0)

    const savedRecord = await db.transaction(async (trx) => {
      const maxVersionResult = await trx.rawQuery(
        'SELECT COALESCE(MAX(version), 0)::int AS max_version FROM item_rubrics WHERE item_id = :itemId',
        { itemId }
      )
      const nextVersion = Number(maxVersionResult.rows[0]?.max_version ?? 0) + 1

      await trx.rawQuery(
        'UPDATE item_rubrics SET is_current = false WHERE item_id = :itemId',
        { itemId }
      )

      const rubric = new ItemRubric()
      rubric.useTransaction(trx)
      rubric.itemId = itemId
      rubric.version = nextVersion
      rubric.criteria = criteria
      rubric.maxPoints = calculatedMaxPoints
      rubric.isCurrent = true
      rubric.createdBy = userSuid
      await rubric.save()

      return rubric
    })

    functionalityCache.invalidate()

    const versions = await this.getVersions(itemId)
    const current = versions.find((v) => v.id === savedRecord.id)
    if (!current) {
      throw new Error('Failed to retrieve newly created rubric.')
    }

    return current
  }
}
