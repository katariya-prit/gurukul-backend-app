import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import FunctionalityService from '#services/functionality_service'
import {
  createFunctionalityValidator,
  updateFunctionalityValidator,
  activeToggleValidator,
  bulkDepartmentAssignmentValidator,
  bulkFunctionalityAssignmentValidator,
} from '#validators/functionality'
import { ValidationError } from '#services/item_service'

export default class FunctionalitiesController {
  private service = new FunctionalityService()

  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page')
      const limit = request.input('limit')
      const search = request.input('search')
      const isActive = request.input('isActive')
      const all = request.input('all')

      const result = await this.service.list({ page, limit, search, isActive, all })
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
      const id = Number(params.id)
      const data = await this.service.getById(id)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Functionality was not found.',
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

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createFunctionalityValidator)
      const data = await this.service.create(payload)

      return response.status(201).json({
        success: true,
        message: 'Functionality created successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const body = request.body()
      if (Object.keys(body).length === 1 && typeof body.isActive === 'boolean') {
        const data = await this.service.setActive(id, body.isActive)
        if (!data) {
          return response.status(404).json({
            success: false,
            message: 'Functionality was not found.',
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Functionality status updated successfully.',
          data,
        })
      }

      const payload = await request.validateUsing(updateFunctionalityValidator)
      const data = await this.service.update(id, payload)
      if (!data) {
        return response.status(404).json({
          success: false,
          message: 'Functionality was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Functionality updated successfully.',
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
          message: 'Functionality was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Functionality active status updated.',
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
          message: 'Functionality was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Functionality deactivated successfully.',
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async departments({ params, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const data = await this.service.getDepartments(id)
      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async updateDepartments({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const payload = await request.validateUsing(bulkDepartmentAssignmentValidator)
      const data = await this.service.updateDepartments(id, payload.departments)

      return response.status(200).json({
        success: true,
        message: 'Department assignments updated successfully.',
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async forDepartment({ params, response }: HttpContext) {
    try {
      const departmentId = Number(params.departmentId)
      const data = await this.service.getForDepartment(departmentId)

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async updateForDepartment({ params, request, response }: HttpContext) {
    try {
      const departmentId = Number(params.departmentId)
      const body = request.body()
      if (Array.isArray(body.functionalities)) {
        const payload = await request.validateUsing(bulkFunctionalityAssignmentValidator)
        const data = await this.service.updateForDepartment(departmentId, payload.functionalities)
        return response.status(200).json({
          success: true,
          message: 'Department functionalities updated successfully.',
          data,
        })
      }

      const singlePayload = {
        functionalityId: Number(body.functionalityId),
        itemLabel: typeof body.itemLabel === 'string' ? body.itemLabel : 'Item',
        isEnabled: Boolean(body.isEnabled),
      }
      const data = await this.service.updateForDepartment(departmentId, [singlePayload])
      return response.status(200).json({
        success: true,
        message: 'Department functionality assignment updated.',
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
