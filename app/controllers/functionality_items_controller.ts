import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import ItemService, { ValidationError } from '#services/item_service'
import { createItemValidator, updateItemValidator, activeToggleValidator } from '#validators/functionality'

export default class FunctionalityItemsController {
  private service = new ItemService()

  public async index({ request, response }: HttpContext) {
    try {
      const functionalityId = request.input('functionalityId') ? Number(request.input('functionalityId')) : undefined
      const departmentId = request.input('departmentId') ? Number(request.input('departmentId')) : undefined
      const search = request.input('search')
      const isActive = request.input('isActive')
      const page = request.input('page')
      const limit = request.input('limit')
      const all = request.input('all')

      const result = await this.service.list({
        functionalityId,
        departmentId,
        search,
        isActive,
        page,
        limit,
        all,
      })

      return response.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async byFunctionality({ params, request, response }: HttpContext) {
    try {
      const functionalityId = Number(params.id)
      const departmentId = request.input('departmentId') ? Number(request.input('departmentId')) : undefined
      const search = request.input('search')
      const isActive = request.input('isActive')
      const page = request.input('page')
      const limit = request.input('limit')
      const all = request.input('all') ?? true

      const result = await this.service.list({
        functionalityId,
        departmentId,
        search,
        isActive,
        page,
        limit,
        all,
      })

      return response.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async summaries({ request, response }: HttpContext) {
    try {
      const functionalityId = request.input('functionalityId') ? Number(request.input('functionalityId')) : undefined
      const departmentId = request.input('departmentId') ? Number(request.input('departmentId')) : undefined
      const search = request.input('search')
      const isActive = request.input('isActive')
      const page = request.input('page')
      const limit = request.input('limit')
      const all = request.input('all')

      const result = await this.service.getSummaries({
        functionalityId,
        departmentId,
        search,
        isActive,
        page,
        limit,
        all,
      })

      return response.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const id = Number(params.itemId || params.id)
      const data = await this.service.getById(id)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Item was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async store({ params, request, response }: HttpContext) {
    try {
      const functionalityId = Number(params.id)
      const payload = await request.validateUsing(createItemValidator)

      const data = await this.service.create({
        functionalityId,
        departmentId: payload.departmentId,
        name: payload.name,
        icon: payload.icon ?? null,
        isActive: payload.isActive ?? true,
      })

      return response.status(201).json({
        success: true,
        message: 'Item created successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.itemId || params.id)
      const body = request.body()

      if (Object.keys(body).length === 1 && typeof body.isActive === 'boolean') {
        const data = await this.service.setActive(id, body.isActive)
        if (!data) {
          return response.status(404).json({
            success: false,
            message: 'Item was not found.',
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Item status updated successfully.',
          data,
        })
      }

      const payload = await request.validateUsing(updateItemValidator)
      const data = await this.service.update(id, payload)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Item was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Item updated successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async setActive({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.itemId || params.id)
      const payload = await request.validateUsing(activeToggleValidator)
      const data = await this.service.setActive(id, payload.isActive)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Item was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Item active status updated.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const id = Number(params.itemId || params.id)
      const success = await this.service.softDelete(id)
      if (!success) {
        return response.status(404).json({
          success: false,
          message: 'Item was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Item deactivated successfully.',
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
