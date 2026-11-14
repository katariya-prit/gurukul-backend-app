import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import LevelService from '#services/level_service'
import { saveLevelsValidator } from '#validators/functionality'
import { ValidationError } from '#services/item_service'

export default class ItemLevelsController {
  private service = new LevelService()

  public async index({ params, response }: HttpContext) {
    try {
      const itemId = Number(params.itemId || params.id)
      const data = await this.service.getLevels(itemId)

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const itemId = Number(params.itemId || params.id)
      const payload = await request.validateUsing(saveLevelsValidator)

      const data = await this.service.saveLevels(itemId, payload.levels)

      return response.status(200).json({
        success: true,
        message: 'Item levels saved successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  private handleError(response: HttpContext['response'], error: unknown) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return response.status(422).json({
        success: false,
        message: error.messages[0]?.message || 'Invalid input data.',
        errors: error.messages,
      })
    }

    if (error instanceof ValidationError) {
      return response.status(error.status).json({
        success: false,
        message: error.message,
      })
    }

    const message = error instanceof Error ? error.message : 'Server error occurred.'
    return response.status(500).json({
      success: false,
      message,
    })
  }
}
