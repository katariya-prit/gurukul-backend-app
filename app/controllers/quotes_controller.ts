
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { v2 as cloudinary } from 'cloudinary'
import env from '#start/env'
import Quote from '#models/quote'

cloudinary.config({
    cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: env.get('CLOUDINARY_API_KEY'),
    api_secret: env.get('CLOUDINARY_API_SECRET'),
})

type QuoteType = 'activity' | 'event'
type ApprovalStatus = 'Approved' | 'Rejected' | 'Pending'
type QuoteStatus = 'Active' | 'Inactive'
type HeroStatus = 'Yes' | 'No'

export default class QuotesController {
    private parseDate(value: unknown, field: string, required = false): DateTime | null {
        if (value === undefined || value === null || value === '') {
            if (required) {
                throw new Error(`${field} is required`)
            }

            return null
        }

        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new Error(`${field} must use YYYY-MM-DD format`)
        }

        const date = DateTime.fromISO(value, { zone: 'utc' })

        if (!date.isValid || date.toISODate() !== value) {
            throw new Error(`${field} is not a valid date`)
        }

        return date
    }

    private getQuoteType(value: unknown): QuoteType | null {
        return value === 'activity' || value === 'event' ? value : null
    }

    private getOptionalText(value: unknown): string | null {
        if (value === undefined || value === null) {
            return null
        }

        return typeof value === 'string' && value.trim() ? value.trim() : null
    }

    private getStatus<T extends string>(
        value: unknown,
        allowed: readonly T[],
        fallback: T
    ): T {
        return typeof value === 'string' && allowed.includes(value as T)
            ? (value as T)
            : fallback
    }

    async createQuote({ request, response }: HttpContext) {
        const type = this.getQuoteType(request.input('type'))
        const dateValue = request.input('date') ?? request.input('event_date')

        if (!type) {
            return response.badRequest({ message: 'Type must be activity or event' })
        }

        let eventDate: DateTime | null

        try {
            eventDate = this.parseDate(dateValue, 'date', true)
        } catch (error) {
            return response.badRequest({
                message: error instanceof Error ? error.message : 'Invalid date',
            })
        }

        const file = request.file('image', {
            size: '10mb',
            extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })

        if (!file) {
            return response.badRequest({ message: 'Image is required' })
        }

        if (!file.isValid || !file.tmpPath) {
            return response.badRequest({
                message: 'Image must be JPG, JPEG, PNG, or WEBP and under 10MB',
                errors: file.errors,
            })
        }

        let uploadedImage: Awaited<ReturnType<typeof cloudinary.uploader.upload>>

        try {
            uploadedImage = await cloudinary.uploader.upload(file.tmpPath, {
                folder: 'gurukul/quotes',
                resource_type: 'image',
            })
        } catch {
            return response.internalServerError({
                message: 'Image upload failed',
            })
        }

        try {
            const quote = await Quote.create({
                type,
                imageUrl: uploadedImage.secure_url,
                publicId: uploadedImage.public_id,
                title: this.getOptionalText(request.input('title')) ?? '',
                description: this.getOptionalText(request.input('description')),
                eventDate: eventDate!,
                name: this.getOptionalText(request.input('name')),
                displayStartDate: this.parseDate(
                    request.input('displayStartDate') ?? request.input('display_start_date'),
                    'displayStartDate'
                ),
                displayEndDate: this.parseDate(
                    request.input('displayEndDate') ?? request.input('display_end_date'),
                    'displayEndDate'
                ),
                eventStartDate: this.parseDate(
                    request.input('eventStartDate') ?? request.input('event_start_date'),
                    'eventStartDate'
                ),
                eventEndDate: this.parseDate(
                    request.input('eventEndDate') ?? request.input('event_end_date'),
                    'eventEndDate'
                ),
                isApproved: this.getStatus<ApprovalStatus>(
                    request.input('isApproved') ?? request.input('is_approved'),
                    ['Approved', 'Rejected', 'Pending'],
                    'Pending'
                ),
                status: this.getStatus<QuoteStatus>(
                    request.input('status'),
                    ['Active', 'Inactive'],
                    'Active'
                ),
                addToHero: this.getStatus<HeroStatus>(
                    request.input('addToHero') ?? request.input('add_to_hero'),
                    ['Yes', 'No'],
                    'No'
                ),
            })

            return response.created({
                message: 'Quote created successfully',
                data: quote,
            })
        } catch (error) {
            await cloudinary.uploader.destroy(uploadedImage.public_id).catch(() => null)

            return response.badRequest({
                message: error instanceof Error ? error.message : 'Could not create quote',
            })
        }
    }

    async getQuotesByType({ request, response }: HttpContext) {
        const type = this.getQuoteType(request.param('type'))

        if (!type) {
            return response.badRequest({
                message: 'Type must be activity or event',
            })
        }

        const includeUnapproved = request.input('includeUnapproved') === 'true'

        const query = Quote.query()
            .where('type', type)
            .orderBy('event_date', 'desc')
            .orderBy('id', 'desc')

        if (!includeUnapproved) {
            query.where('is_approved', 'Approved').where('status', 'Active')
        }

        const quotes = await query

        return response.ok({
            data: quotes,
        })
    }

    async updateQuote({ params, request, response }: HttpContext) {
        const quote = await Quote.find(params.id)

        if (!quote) {
            return response.notFound({ message: 'Quote not found' })
        }

        const typeValue = request.input('type')

        if (typeValue !== undefined) {
            const type = this.getQuoteType(typeValue)

            if (!type) {
                return response.badRequest({
                    message: 'Type must be activity or event',
                })
            }

            quote.type = type
        }

        try {
            const dateValue = request.input('date') ?? request.input('event_date')

            if (dateValue !== undefined) {
                quote.eventDate = this.parseDate(dateValue, 'date', true)!
            }

            const dateFields = [
                {
                    keys: ['displayStartDate', 'display_start_date'],
                    field: 'displayStartDate',
                    assign: (date: DateTime | null) => {
                        quote.displayStartDate = date
                    },
                },
                {
                    keys: ['displayEndDate', 'display_end_date'],
                    field: 'displayEndDate',
                    assign: (date: DateTime | null) => {
                        quote.displayEndDate = date
                    },
                },
                {
                    keys: ['eventStartDate', 'event_start_date'],
                    field: 'eventStartDate',
                    assign: (date: DateTime | null) => {
                        quote.eventStartDate = date
                    },
                },
                {
                    keys: ['eventEndDate', 'event_end_date'],
                    field: 'eventEndDate',
                    assign: (date: DateTime | null) => {
                        quote.eventEndDate = date
                    },
                },
            ]

            for (const item of dateFields) {
                const key = item.keys.find((candidate) =>
                    request.input(candidate) !== undefined
                )

                if (key) {
                    item.assign(this.parseDate(request.input(key), item.field))
                }
            }

            if (request.input('title') !== undefined) {
                quote.title = this.getOptionalText(request.input('title')) ?? ''
            }

            if (request.input('description') !== undefined) {
                quote.description = this.getOptionalText(request.input('description'))
            }

            if (request.input('name') !== undefined) {
                quote.name = this.getOptionalText(request.input('name'))
            }

            const approvalValue = request.input('isApproved') ?? request.input('is_approved')

            if (approvalValue !== undefined) {
                quote.isApproved = this.getStatus<ApprovalStatus>(
                    approvalValue,
                    ['Approved', 'Rejected', 'Pending'],
                    quote.isApproved
                )
            }

            if (request.input('status') !== undefined) {
                quote.status = this.getStatus<QuoteStatus>(
                    request.input('status'),
                    ['Active', 'Inactive'],
                    quote.status
                )
            }

            const heroValue = request.input('addToHero') ?? request.input('add_to_hero')

            if (heroValue !== undefined) {
                quote.addToHero = this.getStatus<HeroStatus>(
                    heroValue,
                    ['Yes', 'No'],
                    quote.addToHero
                )
            }
        } catch (error) {
            return response.badRequest({
                message: error instanceof Error ? error.message : 'Invalid field value',
            })
        }

        const file = request.file('image', {
            size: '10mb',
            extnames: ['jpg', 'jpeg', 'png', 'webp'],
        })

        let newPublicId: string | null = null
        const oldPublicId = quote.publicId

        if (file) {
            if (!file.isValid || !file.tmpPath) {
                return response.badRequest({
                    message: 'Image must be JPG, JPEG, PNG, or WEBP and under 10MB',
                    errors: file.errors,
                })
            }

            try {
                const uploaded = await cloudinary.uploader.upload(file.tmpPath, {
                    folder: 'gurukul/quotes',
                    resource_type: 'image',
                })

                quote.imageUrl = uploaded.secure_url
                quote.publicId = uploaded.public_id
                newPublicId = uploaded.public_id
            } catch {
                return response.internalServerError({
                    message: 'Image upload failed',
                })
            }
        }

        try {
            await quote.save()
        } catch {
            if (newPublicId) {
                await cloudinary.uploader.destroy(newPublicId).catch(() => null)
            }

            return response.internalServerError({
                message: 'Could not update quote',
            })
        }

        if (newPublicId && oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId).catch(() => null)
        }

        return response.ok({
            message: 'Quote updated successfully',
            data: quote,
        })
    }

    async deleteQuote({ params, response }: HttpContext) {
        const quote = await Quote.find(params.id)

        if (!quote) {
            return response.notFound({ message: 'Quote not found' })
        }

        const publicId = quote.publicId

        await quote.delete()

        if (publicId) {
            await cloudinary.uploader.destroy(publicId).catch(() => null)
        }

        return response.ok({
            message: 'Quote deleted successfully',
        })
    }
}
