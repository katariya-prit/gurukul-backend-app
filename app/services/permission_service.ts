import db from '@adonisjs/lucid/services/db'
import ItemPermission from '#models/item_permission'
import FunctionalityItem from '#models/functionality_item'
import Role from '#models/role'
import Section from '#models/section'
import User from '#models/user'
import { functionalityCache } from '#services/functionality_cache_service'
import { ValidationError } from '#services/item_service'

export interface ItemPermissionsDto {
  roleCodes: string[]
  sectionIds: number[]
  userSuids: number[]
  roles: Array<{ roleCode: string; name: string }>
  sections: Array<{ sectionId: number; name: string }>
  users: Array<{ suid: number; name: string }>
}

export default class PermissionService {
  async getPermissions(itemId: number): Promise<ItemPermissionsDto> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    const rows = await ItemPermission.query().where('item_id', itemId)

    const roleCodes: string[] = []
    const sectionIds: number[] = []
    const userSuids: number[] = []

    for (const r of rows) {
      if (r.roleCode && !roleCodes.includes(r.roleCode)) roleCodes.push(r.roleCode)
      if (r.sectionId && !sectionIds.includes(r.sectionId)) sectionIds.push(r.sectionId)
      if (r.userSuid && !userSuids.includes(Number(r.userSuid))) userSuids.push(Number(r.userSuid))
    }

    const roles = roleCodes.length > 0 ? await Role.query().whereIn('role_code', roleCodes) : []
    const sections = sectionIds.length > 0 ? await Section.query().whereIn('section_id', sectionIds) : []
    const users = userSuids.length > 0 ? await User.query().whereIn('suid', userSuids) : []

    return {
      roleCodes,
      sectionIds,
      userSuids,
      roles: roles.map((role) => ({ roleCode: role.roleCode, name: role.roleName })),
      sections: sections.map((sec) => ({ sectionId: sec.sectionId, name: sec.name })),
      users: users.map((u) => ({ suid: Number(u.suid), name: u.name })),
    }
  }

  async savePermissions(
    itemId: number,
    permissions: {
      roleCodes?: string[]
      sectionIds?: number[]
      userSuids?: number[]
    }
  ): Promise<ItemPermissionsDto> {
    const item = await FunctionalityItem.find(itemId)
    if (!item) {
      throw new ValidationError('Item was not found.')
    }

    const roleCodes = Array.from(new Set(permissions.roleCodes || []))
    const sectionIds = Array.from(new Set(permissions.sectionIds || []))
    const userSuids = Array.from(new Set(permissions.userSuids || []))

    await db.transaction(async (trx) => {
      await trx.rawQuery('DELETE FROM item_permissions WHERE item_id = :itemId', { itemId })

      for (const roleCode of roleCodes) {
        await trx.rawQuery(
          'INSERT INTO item_permissions (item_id, role_code) VALUES (:itemId, :roleCode)',
          { itemId, roleCode }
        )
      }

      for (const sectionId of sectionIds) {
        await trx.rawQuery(
          'INSERT INTO item_permissions (item_id, section_id) VALUES (:itemId, :sectionId)',
          { itemId, sectionId }
        )
      }

      for (const userSuid of userSuids) {
        await trx.rawQuery(
          'INSERT INTO item_permissions (item_id, user_suid) VALUES (:itemId, :userSuid)',
          { itemId, userSuid }
        )
      }
    })

    functionalityCache.invalidate()
    return this.getPermissions(itemId)
  }
}
