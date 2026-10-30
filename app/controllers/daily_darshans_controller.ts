import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'
import DailyDarshan from '#models/daily_darshan'

cloudinary.config({
    cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: env.get('CLOUDINARY_API_KEY'),
    api_secret: env.get('CLOUDINARY_API_SECRET'),
    secure: true,
})

const FOLDER = 'gurukul/daily-darshan'
const IMAGE_RULES = { size: '10mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }

export default class DailyDarshansController {
    private toDto(row: DailyDarshan) {
        return {
            id: row.id,
            title: row.title,
            imageUrl: row.imageUrl,
            description: row.description ?? '',
            date: row.date?.toISODate() ?? '',
        }
    }

    private parseDate(value: unknown): DateTime | null {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
        const date = DateTime.fromISO(value)
        return date.isValid ? date : null
    }

    private publicIdFromUrl(url: string): string | null {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/)
        const publicId = match?.[1] ?? null
        return publicId && publicId.startsWith(`${FOLDER}/`) ? publicId : null
    }

    private async removeImage(url: string) {
        const publicId = this.publicIdFromUrl(url)
        if (!publicId) return
        await cloudinary.uploader.destroy(publicId).catch(() => null)
    }

    // GET /daily-darshan  (public page + admin list)
    public async index({ response }: HttpContext) {
        try {
            const rows = await DailyDarshan.query().orderBy('date', 'desc').orderBy('created_at', 'desc')
            return response.status(200).json({ success: true, data: rows.map((r) => this.toDto(r)) })
        } catch (error: any) {
            return response.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch daily darshan entries',
            })
        }
    }

    // POST /daily-darshan  (multipart: image, title, description, date)
    public async store({ request, response }: HttpContext) {
        const title = String(request.input('title') ?? '').trim()
        if (!title) {
            return response.status(400).json({ success: false, message: 'Title is required' })
        }

        const file = request.file('image', IMAGE_RULES)
        if (!file) {
            return response.status(400).json({ success: false, message: 'Image is required' })
        }
        if (!file.isValid || !file.tmpPath) {
            return response.status(400).json({
                success: false,
                message: file.errors[0]?.message || 'Image must be JPG, JPEG, PNG or WEBP and under 10MB',
            })
        }

        const dateInput = request.input('date')
        const date = dateInput ? this.parseDate(dateInput) : DateTime.now()
        if (!date) {
            return response.status(400).json({ success: false, message: 'Date must be YYYY-MM-DD' })
        }

        let uploaded: Awaited<ReturnType<typeof cloudinary.uploader.upload>>
        try {
            uploaded = await cloudinary.uploader.upload(file.tmpPath, {
                folder: FOLDER,
                resource_type: 'image',
            })
        } catch {
            return response.status(500).json({ success: false, message: 'Image upload failed' })
        }

        try {
            const row = await DailyDarshan.create({
                title,
                imageUrl: uploaded.secure_url,
                description: String(request.input('description') ?? '').trim(),
                date,
            })
            return response.status(201).json({ success: true, data: this.toDto(row) })
        } catch (error: any) {
            await cloudinary.uploader.destroy(uploaded.public_id).catch(() => null)
            return response.status(500).json({
                success: false,
                message: error.message || 'Failed to create daily darshan entry',
            })
        }
    }

    // PUT /daily-darshan/:id  (image optional)
    public async update({ params, request, response }: HttpContext) {
        const id = Number(params.id)
        const title = String(request.input('title') ?? '').trim()
        if (!id || !title) {
            return response
                .status(400)
                .json({ success: false, message: 'Valid id and title are required' })
        }

        const row = await DailyDarshan.find(id)
        if (!row) {
            return response.status(404).json({ success: false, message: 'Entry not found' })
        }

        const dateInput = request.input('date')
        if (dateInput) {
            const date = this.parseDate(dateInput)
            if (!date) {
                return response.status(400).json({ success: false, message: 'Date must be YYYY-MM-DD' })
            }
            row.date = date
        }

        row.title = title
        row.description = String(request.input('description') ?? '').trim()

        const file = request.file('image', IMAGE_RULES)
        const oldImageUrl = row.imageUrl
        let newPublicId: string | null = null

        if (file) {
            if (!file.isValid || !file.tmpPath) {
                return response.status(400).json({
                    success: false,
                    message: file.errors[0]?.message || 'Image must be JPG, JPEG, PNG or WEBP and under 10MB',
                })
            }
            try {
                const uploaded = await cloudinary.uploader.upload(file.tmpPath, {
                    folder: FOLDER,
                    resource_type: 'image',
                })
                row.imageUrl = uploaded.secure_url
                newPublicId = uploaded.public_id
            } catch {
                return response.status(500).json({ success: false, message: 'Image upload failed' })
            }
        }

        try {
            await row.save()
        } catch (error: any) {
            if (newPublicId) await cloudinary.uploader.destroy(newPublicId).catch(() => null)
            return response.status(500).json({
                success: false,
                message: error.message || 'Failed to update daily darshan entry',
            })
        }

        if (newPublicId) await this.removeImage(oldImageUrl)

        return response
            .status(200)
            .json({ success: true, message: 'Updated successfully', data: this.toDto(row) })
    }

    // DELETE /daily-darshan/:id
    public async destroy({ params, response }: HttpContext) {
        const id = Number(params.id)
        const row = id ? await DailyDarshan.find(id) : null
        if (!row) {
            return response.status(404).json({ success: false, message: 'Entry not found' })
        }

        const imageUrl = row.imageUrl

        try {
            await row.delete()
        } catch (error: any) {
            return response.status(500).json({
                success: false,
                message: error.message || 'Failed to delete entry',
            })
        }

        await this.removeImage(imageUrl)

        return response.status(200).json({ success: true, message: 'Deleted successfully' })
    }
}