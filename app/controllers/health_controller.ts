import type { HttpContext } from '@adonisjs/core/http'

export default class HealthController {
  public async index({ response }: HttpContext) {
    return response.status(200).json({
      success: true,
      message: 'Gurukul API is healthy',
    })
  }
}
