import db from '@adonisjs/lucid/services/db'
import ItemLevel from '#models/item_level'
import FunctionalityItem from '#models/functionality_item'
import { functionalityCache } from '#services/functionality_cache_service'
import { ValidationError } from '#services/item_service'

export interface ItemLevelDto {
  id: number
  itemId: number
  levelNo: number
  name: string
  minPoints: number
  promoteMode: 'auto' | 'manual'
}

export default class LevelService {
  async getLevels(itemId: number): Promise<ItemLevelDto[]> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    const rows = await ItemLevel.query()
      .where('item_id', itemId)
      .orderBy('level_no', 'asc')

    return rows.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      levelNo: r.levelNo,
      name: r.name,
      minPoints: r.minPoints,
      promoteMode: r.promoteMode,
    }))
  }

  async saveLevels(
    itemId: number,
    levels: Array<{ levelNo: number; name: string; minPoints: number; promoteMode: 'auto' | 'manual' }>
  ): Promise<ItemLevelDto[]> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    const newLevelNos = new Set(levels.map((l) => l.levelNo))

    const studentLevelsResult = await db.rawQuery(
      'SELECT DISTINCT current_level_no FROM student_items WHERE item_id = :itemId',
      { itemId }
    )

    for (const row of studentLevelsResult.rows) {
      const activeLevel = Number(row.current_level_no)
      if (!newLevelNos.has(activeLevel)) {
        throw new ValidationError(
          `Cannot remove level ${activeLevel} because students are currently assigned to this level.`
        )
      }
    }

    await db.transaction(async (trx) => {
      await trx.rawQuery('DELETE FROM item_levels WHERE item_id = :itemId', { itemId })

      for (const level of levels) {
        await trx.rawQuery(
          `
            INSERT INTO item_levels (item_id, level_no, name, min_points, promote_mode)
            VALUES (:itemId, :levelNo, :name, :minPoints, :promoteMode)
          `,
          {
            itemId,
            levelNo: level.levelNo,
            name: level.name.trim(),
            minPoints: level.minPoints,
            promoteMode: level.promoteMode,
          }
        )
      }
    })

    functionalityCache.invalidate()
    return this.getLevels(itemId)
  }
}
