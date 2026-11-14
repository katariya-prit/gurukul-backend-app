import type { HttpContext } from '@adonisjs/core/http'
import LookupService from '#services/lookup_service'

export default class MeController {
  private service = new LookupService()

  public async navigation({ response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const data = await this.service.getNavigation(user)

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server error occurred.'
      return response.status(500).json({
        success: false,
        message,
      })
    }
  }

  public async items({ response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const data = await this.service.getMyItems(user)

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server error occurred.'
      return response.status(500).json({
        success: false,
        message,
      })
    }
  }
}
