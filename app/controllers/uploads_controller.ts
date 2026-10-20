import type { HttpContext } from '@adonisjs/core/http'
import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'

cloudinary.config({
    cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: env.get('CLOUDINARY_API_KEY'),
    api_secret: env.get('CLOUDINARY_API_SECRET'),
    secure: true,
})

// Frontend uploadService.ts sathe match: avatar -> field "avatar", section -> field "image"
const IMAGE_RULES = {
    size: '5mb',
    extnames: ['jpg', 'jpeg', 'png', 'webp'],
}

export default class UploadController {
    private async handleUpload({ request, response }: HttpContext, field: string, folder: string) {
        const file = request.file(field, IMAGE_RULES)

        if (!file) {
            return response.status(400).json({ success: false, message: 'Koi file upload nathi thai.' })
        }

        if (!file.isValid) {
            return response.status(400).json({
                success: false,
                message: file.errors[0]?.message || 'Invalid file.',
            })
        }

        try {
            const result = await cloudinary.uploader.upload(file.tmpPath!, {
                folder,
                resource_type: 'image',
            })

            // Juna Express controller jevo j response: url + publicId
            return response.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                url: result.secure_url,
                publicId: result.public_id,
            })
        } catch (error: any) {
            return response.status(500).json({
                success: false,
                message: error.message || 'Image upload karva ma error aavi.',
            })
        }
    }

    // POST /upload/avatar
    public async avatar(ctx: HttpContext) {
        return this.handleUpload(ctx, 'avatar', 'gurukul/avatars')
    }

    // POST /upload/section
    public async section(ctx: HttpContext) {
        return this.handleUpload(ctx, 'image', 'gurukul/sections')
    }
}