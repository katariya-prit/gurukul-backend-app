import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {

    // GET /users
    public async index({ response }: HttpContext) {
        try {
            const users = await User.query()
                .select('suid', 'avatar', 'name', 'username', 'bod', 'departmentId', 'sectionId', 'standardId', 'roleCode', 'joiningDate', 'status', 'createdAt', 'updatedAt')
                .orderBy('suid', 'asc')

            return response.status(200).json({ success: true, data: users })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // GET /users/pending
    public async pending({ response }: HttpContext) {
        try {
            const users = await User.query()
                .select('suid', 'avatar', 'name', 'username', 'bod', 'departmentId', 'sectionId', 'standardId', 'roleCode', 'joiningDate', 'status', 'createdAt', 'updatedAt')
                .where('status', 'PENDING')
                .orderBy('suid', 'asc')

            return response.status(200).json({ success: true, data: users })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // PUT /users/approve/:id
    public async approve({ params, response }: HttpContext) {
        try {
            const id = Number(params.id)
            if (!id) {
                return response.status(400).json({ success: false, message: 'Invalid ID' })
            }

            const user = await User.find(id)
            if (!user) {
                return response.status(404).json({ success: false, message: 'User not found' })
            }

            user.status = 'APPROVED'
            await user.save()

            return response.status(200).json({
                success: true,
                message: 'User approved successfully',
                data: user,
            })
        } catch (error: any) {
            return response.status(400).json({ success: false, message: error.message || 'Failed to approve user' })
        }
    }

    // DELETE /users/delete/:id
    public async destroy({ params, response }: HttpContext) {
        try {
            const id = Number(params.id)
            if (!id) {
                return response.status(400).json({ success: false, message: 'Invalid ID' })
            }

            const user = await User.find(id)
            if (!user) {
                return response.status(404).json({ success: false, message: 'User not found' })
            }

            await user.delete()

            return response.status(200).json({ success: true, message: 'User deleted successfully' })
        } catch (error: any) {
            return response.status(400).json({ success: false, message: error.message || 'Failed to delete user' })
        }
    }

    // GET /users/section/:sectionId
    public async bySection({ params, response }: HttpContext) {
        try {
            const sectionId = Number(params.sectionId)
            if (!sectionId) {
                return response.status(400).json({ success: false, message: 'Invalid Section ID' })
            }

            const users = await User.query()
                .select('suid', 'avatar', 'name', 'username', 'bod', 'departmentId', 'sectionId', 'standardId', 'roleCode', 'joiningDate', 'status', 'createdAt', 'updatedAt')
                .where('sectionId', sectionId)

            return response.status(200).json({ success: true, data: users })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }
}