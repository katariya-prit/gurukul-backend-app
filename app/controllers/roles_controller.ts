import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { createRoleValidator, updateRoleValidator } from '#validators/role'

export default class RolesController {

    // GET /roles
    public async index({ response }: HttpContext) {
        try {
            const roles = await Role.query().orderBy('role_code', 'asc')
            return response.status(200).json({
                success: true,
                message: 'Roles fetched successfully!',
                data: roles,
            })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: 'Server Error', error: error.message })
        }
    }

    // POST /roles/create
    public async store({ request, response }: HttpContext) {
        try {
            const payload = await request.validateUsing(createRoleValidator)

            const newRole = await Role.create({
                roleCode: payload.roleCode,
                roleName: payload.roleName,
                description: payload.description ?? null,
                permissions: (payload.permissions ?? {}) as Role['permissions'],   // 👈 type cast
            })

            return response.status(201).json({
                success: true,
                message: 'Role created successfully!',
                data: newRole,
            })
        } catch (error: any) {
            if (error.code === '23505') {
                return response.status(400).json({ success: false, message: 'Role Name or Role Code already exists.' })
            }
            if (error.messages) {
                return response.status(422).json({ success: false, message: 'Validation failed', errors: error.messages })
            }
            return response.status(500).json({ success: false, message: error.message })
        }
    }

    // PUT /roles/:roleCode
    public async update({ params, request, response }: HttpContext) {
        try {
            const roleCode = String(params.roleCode || '')
            if (!roleCode) {
                return response.status(400).json({ success: false, message: 'Role code is required.' })
            }

            const role = await Role.find(roleCode)
            if (!role) {
                return response.status(404).json({ success: false, message: 'Role not found.' })
            }

            const payload = await request.validateUsing(updateRoleValidator)

            role.merge({
                roleName: payload.roleName ?? role.roleName,
                description: payload.description !== undefined ? payload.description : role.description,
                permissions: (payload.permissions ?? role.permissions) as Role['permissions'],   // 👈 type cast
            })

            await role.save()

            return response.status(200).json({
                success: true,
                message: 'Role updated successfully!',
                data: role,
            })
        } catch (error: any) {
            if (error.code === '23505') {
                return response.status(400).json({ success: false, message: 'Role Name already exists.' })
            }
            if (error.messages) {
                return response.status(422).json({ success: false, message: 'Validation failed', errors: error.messages })
            }
            return response.status(404).json({ success: false, message: error.message || 'Role not found.' })
        }
    }
}