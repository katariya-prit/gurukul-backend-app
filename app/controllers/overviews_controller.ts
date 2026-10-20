import type { HttpContext } from '@adonisjs/core/http'
import OverviewImage from '#models/overview_image'
import { createOverviewValidator, updateOverviewMetadataValidator, VALID_SECTIONS } from '#validators/overview_image'

export default class OverviewsController {

  // GET /overview
  public async index({ response }: HttpContext) {
    try {
      const images = await OverviewImage.query().orderBy('id', 'asc')

      // 🎯 section mujab group karyu - frontend { heroSlider: [...], featureImage: [...] } expect kare chhe
      const grouped: Record<string, any[]> = {}
      for (const section of VALID_SECTIONS) {
        grouped[section] = []
      }
      for (const img of images) {
        grouped[img.section]?.push(img)
      }

      return response.status(200).json({ success: true, data: grouped })
    } catch (error: any) {
      return response.status(500).json({ success: false, message: error.message })
    }
  }

  // POST /overview/update
  // 🎯 Note: have JSON body expect kare chhe (url + publicId), file nahi -
  // image pehla /upload/* endpoint thi Cloudinary par upload thai ne aavshe
  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createOverviewValidator)

      const saved = await OverviewImage.create({
        section: payload.section,
        url: payload.url,
        publicId: payload.publicId,
        title: payload.title?.trim() ?? '',
        description: payload.description?.trim() ?? '',
      })

      return response.status(201).json({
        success: true,
        message: 'Overview updated successfully',
        data: saved,
      })
    } catch (error: any) {
      if (error.messages) {
        return response.status(422).json({ success: false, message: 'Validation failed', errors: error.messages })
      }
      return response.status(500).json({ success: false, message: error.message })
    }
  }

  // PATCH /overview/:id
  public async updateMetadata({ params, request, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const image = await OverviewImage.find(id)

      if (!image) {
        return response.status(404).json({ success: false, message: 'Image not found' })
      }

      const payload = await request.validateUsing(updateOverviewMetadataValidator)

      image.merge({
        title: payload.title?.trim() ?? image.title,
        description: payload.description?.trim() ?? image.description,
      })

      await image.save()

      return response.status(200).json({ success: true, data: image })
    } catch (error: any) {
      if (error.messages) {
        return response.status(422).json({ success: false, message: 'Validation failed', errors: error.messages })
      }
      return response.status(500).json({ success: false, message: error.message })
    }
  }

  // DELETE /overview/:id
  public async destroy({ params, response }: HttpContext) {
    try {
      const id = Number(params.id)
      const image = await OverviewImage.find(id)

      if (!image) {
        return response.status(404).json({ success: false, message: 'Image not found' })
      }

      // ⚠️ TODO: Cloudinary thi pan delete karvu padshe (public_id vaparine)
      // jo uploads_controller.ts ma e logic hoy to tya thi reuse karvu

      await image.delete()

      return response.status(200).json({ success: true, message: 'Image deleted successfully' })
    } catch (error: any) {
      return response.status(500).json({ success: false, message: error.message })
    }
  }
}