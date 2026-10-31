import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'

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

    // 🔴 NEW: PUT /users/:id
    public async update({ params, request, auth, response }: HttpContext) {
        try {
            const id = Number(params.id)
            if (!id) {
                return response.status(400).json({ success: false, message: 'Invalid ID' })
            }

            const user = await User.find(id)
            if (!user) {
                return response.status(404).json({ success: false, message: 'User not found' })
            }

            const payload = await request.validateUsing(updateUserValidator)

            const currentUser = auth.user!
            const isSuperAdmin = currentUser.roleCode === 'SUPER_ADMIN'

            // 🔒 Password ane suid fakt SUPER_ADMIN j badli shake
            if ((payload.password || payload.suid) && !isSuperAdmin) {
                return response.status(403).json({
                    success: false,
                    message: 'Password અથવા User ID બદલવાની પરવાનગી ફક્ત SUPER_ADMIN પાસે છે.',
                })
            }

            // Basic fields — koi pan authenticated user update kari shake
            if (payload.name !== undefined) user.name = payload.name
            if (payload.username !== undefined) user.username = payload.username
            if (payload.roleCode !== undefined) user.roleCode = payload.roleCode
            if (payload.bod !== undefined) user.bod = payload.bod
            if (payload.joiningDate !== undefined) user.joiningDate = payload.joiningDate

            // 🔒 Password — fakt SUPER_ADMIN, withAuthFinder auto-hash kari dese save() par
            if (isSuperAdmin && payload.password) {
                user.password = payload.password
            }

            // 🔒 suid (User ID / primary key) change — fakt SUPER_ADMIN, risky operation
            if (isSuperAdmin && payload.suid && payload.suid !== user.suid) {
                const newSuid = payload.suid

                const alreadyExists = await User.find(newSuid)
                if (alreadyExists && alreadyExists.suid !== user.suid) {   // 👈 fix — potano j suid hoy to skip
                    return response.status(400).json({
                        success: false,
                        message: 'આ User ID પહેલેથી બીજા user એ વાપરેલું છે.',
                    })
                }

                try {
                    await db.rawQuery(`UPDATE users SET suid = ? WHERE suid = ?`, [newSuid, id])
                } catch {
                    return response.status(400).json({
                        success: false,
                        message: 'User ID બદલી શકાયું નહીં — આ user department/section નો head છે અથવા બીજા રેકોર્ડ્સ સાથે જોડાયેલો છે.',
                    })
                }

                // suid badlai gayo, etle navi id thi fresh record laine baki fields save karo
                const refreshedUser = await User.findOrFail(newSuid)
                if (payload.name !== undefined) refreshedUser.name = payload.name
                if (payload.username !== undefined) refreshedUser.username = payload.username
                if (payload.roleCode !== undefined) refreshedUser.roleCode = payload.roleCode
                if (payload.bod !== undefined) refreshedUser.bod = payload.bod
                if (payload.joiningDate !== undefined) refreshedUser.joiningDate = payload.joiningDate
                if (payload.password) refreshedUser.password = payload.password
                await refreshedUser.save()

                return response.status(200).json({
                    success: true,
                    message: 'User updated successfully',
                    data: refreshedUser,
                })
            }

            await user.save()

            return response.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user,
            })
        } catch (error: any) {
            if (error.messages) {
                return response.status(422).json({ success: false, message: 'Validation failure', errors: error.messages })
            }
            return response.status(400).json({ success: false, message: error.message || 'Failed to update user' })
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