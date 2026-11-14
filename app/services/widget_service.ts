import DashboardWidget, { type DashboardWidgetType, type WidgetConfig } from '#models/dashboard_widget'
import User from '#models/user'
import { functionalityCache } from '#services/functionality_cache_service'
import { ValidationError } from '#services/item_service'

export interface DashboardWidgetDto {
  id: number
  functionalityId: number
  functionalityName: string
  itemId: number | null
  itemName: string | null
  widgetType: DashboardWidgetType
  title: string
  config: WidgetConfig
  roles: string[]
  sortOrder: number
  isActive: boolean
}

export default class WidgetService {
  async listManage(): Promise<DashboardWidgetDto[]> {
    const widgets = await DashboardWidget.query()
      .preload('functionality')
      .preload('item')
      .orderBy('sort_order', 'asc')
      .orderBy('id', 'asc')

    return widgets.map((w) => ({
      id: w.id,
      functionalityId: w.functionalityId,
      functionalityName: w.functionality?.name ?? 'Functionality',
      itemId: w.itemId,
      itemName: w.item?.name ?? null,
      widgetType: w.widgetType,
      title: w.title,
      config: w.config,
      roles: w.roles,
      sortOrder: w.sortOrder,
      isActive: w.isActive,
    }))
  }

  async listForUser(user: User): Promise<DashboardWidgetDto[]> {
    const cacheKey = `widgets_user_${user.roleCode}_${user.suid}`
    const cached = functionalityCache.get<DashboardWidgetDto[]>(cacheKey)
    if (cached) {
      return cached
    }

    const all = await this.listManage()
    const filtered = all.filter((w) => {
      if (!w.isActive) return false
      if (!w.roles || w.roles.length === 0) return true
      return w.roles.includes(user.roleCode)
    })

    functionalityCache.set(cacheKey, filtered, 60 * 1000)
    return filtered
  }

  async create(payload: {
    functionalityId: number
    itemId?: number | null
    widgetType: DashboardWidgetType
    title: string
    config: WidgetConfig
    roles?: string[]
    sortOrder?: number
    isActive?: boolean
  }): Promise<DashboardWidgetDto> {
    const widget = await DashboardWidget.create({
      functionalityId: payload.functionalityId,
      itemId: payload.itemId ?? null,
      widgetType: payload.widgetType,
      title: payload.title.trim(),
      config: payload.config,
      roles: payload.roles ?? [],
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    })

    functionalityCache.invalidate()
    const all = await this.listManage()
    const found = all.find((w) => w.id === widget.id)
    if (!found) {
      throw new Error('Failed to retrieve created widget.')
    }

    return found
  }

  async update(
    id: number,
    payload: {
      functionalityId?: number
      itemId?: number | null
      widgetType?: DashboardWidgetType
      title?: string
      config?: WidgetConfig
      roles?: string[]
      sortOrder?: number
      isActive?: boolean
    }
  ): Promise<DashboardWidgetDto | null> {
    const widget = await DashboardWidget.find(id)
    if (!widget) {
      return null
    }

    if (payload.functionalityId !== undefined) widget.functionalityId = payload.functionalityId
    if (payload.itemId !== undefined) widget.itemId = payload.itemId
    if (payload.widgetType !== undefined) widget.widgetType = payload.widgetType
    if (payload.title !== undefined) widget.title = payload.title.trim()
    if (payload.config !== undefined) widget.config = payload.config
    if (payload.roles !== undefined) widget.roles = payload.roles
    if (payload.sortOrder !== undefined) widget.sortOrder = payload.sortOrder
    if (payload.isActive !== undefined) widget.isActive = payload.isActive

    await widget.save()
    functionalityCache.invalidate()

    const all = await this.listManage()
    return all.find((w) => w.id === widget.id) ?? null
  }

  async setActive(id: number, isActive: boolean): Promise<DashboardWidgetDto | null> {
    return this.update(id, { isActive })
  }

  async softDelete(id: number): Promise<boolean> {
    const widget = await DashboardWidget.find(id)
    if (!widget) {
      throw new ValidationError('Widget was not found.')
    }

    await widget.delete()
    functionalityCache.invalidate()
    return true
  }
}
