import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import RubricService from '#services/rubric_service'
import { saveRubricValidator } from '#validators/functionality'
import { ValidationError } from '#services/item_service'

export default class ItemRubricsController {
  private service = new RubricService()

  public async show({ params, request, response }: HttpContext) {
    try {
      const itemId = Number(params.itemId || params.id)
      const currentOnly = request.input('current') === true || request.input('current') === 'true'

      if (currentOnly) {
        const current = await this.service.getCurrent(itemId)
        return response.status(200).json({
          success: true,
          data: current,
        })
      }

      const versions = await this.service.getVersions(itemId)
      return response.status(200).json({
        success: true,
        data: versions,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async versions({ params, response }: HttpContext) {
    try {
      const itemId = Number(params.itemId || params.id)
      const versions = await this.service.getVersions(itemId)

      return response.status(200).json({
        success: true,
        data: versions,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async update({ params, request, response, auth }: HttpContext) {
    try {
      const itemId = Number(params.itemId || params.id)
      const payload = await request.validateUsing(saveRubricValidator)
      const user = auth.getUserOrFail()

      const data = await this.service.saveRubric(
        itemId,
        payload.criteria,
        BigInt(user.suid),
        payload.maxPoints
      )

      return response.status(200).json({
        success: true,
        message: 'Rubric version saved successfully.',
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
