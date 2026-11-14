import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import WidgetService from '#services/widget_service'
import { createWidgetValidator, updateWidgetValidator, activeToggleValidator } from '#validators/functionality'
import { ValidationError } from '#services/item_service'

export default class DashboardWidgetsController {
  private service = new WidgetService()

  public async manage({ response }: HttpContext) {
    try {
      const data = await this.service.listManage()
      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async index({ response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      if (user.roleCode === 'SUPER_ADMIN') {
        const data = await this.service.listManage()
        return response.status(200).json({
          success: true,
          data,
        })
      }

      const data = await this.service.listForUser(user)
      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createWidgetValidator)
      const data = await this.service.create(payload)

      return response.status(201).json({
        success: true,
        message: 'Dashboard widget created successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const payload = await request.validateUsing(updateWidgetValidator)
      const data = await this.service.update(id, payload)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Widget was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Dashboard widget updated successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async setActive({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const payload = await request.validateUsing(activeToggleValidator)
      const data = await this.service.setActive(id, payload.isActive)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Widget was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Widget active status updated.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const success = await this.service.softDelete(id)
      if (!success) {
        return response.status(404).json({
          success: false,
          message: 'Widget was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Widget deleted successfully.',
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
