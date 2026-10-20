import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { v2 as cloudinary } from 'cloudinary'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import Lesson from '#models/lesson'
import GeminiThumbnailService from '#services/gemini_thumbnail_service'

cloudinary.config({
    cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: env.get('CLOUDINARY_API_KEY'),
    api_secret: env.get('CLOUDINARY_API_SECRET'),
    secure: true,
})

const LESSON_TYPES = ['video', 'audio', 'image', 'document']
const ASSIGN_SCOPES = ['all', 'department', 'section', 'student', 'group']
const HEAD_ROLES = ['HEAD100', 'SECHEAD101']

const uploadImageBuffer = (buffer: Buffer, folder: string) =>
    new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error || !result) {
                    reject(error ?? new Error('Thumbnail upload failed'))
                    return
                }
                resolve({ secure_url: result.secure_url, public_id: result.public_id })
            }
        )
        stream.end(buffer)
    })

export default class LessonController {
    private toApi(l: Lesson) {
        return {
            lesson_id: l.lessonId,
            lesson_title: l.lessonTitle,
            lesson_type: l.lessonType,
            media_url: l.mediaUrl,
            media_public_id: l.mediaPublicId,
            thumbnail_url: l.thumbnailUrl,
            description: l.description,
            department_id: l.departmentId,
            department_name: l.department?.departmentName ?? null,
            date_start: l.dateStart?.toISODate() ?? null,
            date_end: l.dateEnd?.toISODate() ?? null,
            progress_points: l.progressPoints,
            created_by: l.createdBy,
            created_by_name: l.creator?.name ?? null,
            role_code: l.roleCode,
            assign_scope: l.assignScope,
            assign_department_id: l.assignDepartmentId,
            assign_section_id: l.assignSectionId,
            assign_student_id: l.assignStudentId,
            assign_group_id: l.assignGroupId,
            assign_head_only: l.assignHeadOnly,
            created_at: l.createdAt?.toISO() ?? null,
        }
    }

    public async store({ request, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const body = request.body()
        const {
            lesson_title,
            lesson_type,
            department_id,
            date_start,
            date_end,
            description,
            progress_points,
            assignment,
        } = body

        if (!lesson_title || !lesson_type || !date_start || !date_end) {
            return response.status(400).json({
                success: false,
                message: 'Title, type, start date ane end date jaruri chhe.',
            })
        }

        if (!LESSON_TYPES.includes(lesson_type)) {
            return response.status(400).json({ success: false, message: 'Lesson type invalid chhe.' })
        }

        const start = DateTime.fromISO(String(date_start))
        const end = DateTime.fromISO(String(date_end))
        if (!start.isValid || !end.isValid) {
            return response.status(400).json({ success: false, message: 'Date format invalid chhe.' })
        }
        if (end < start) {
            return response
                .status(400)
                .json({ success: false, message: 'End date start date pachi hovi joie.' })
        }

        let parsed: any
        try {
            parsed = typeof assignment === 'string' ? JSON.parse(assignment) : assignment
        } catch {
            return response.status(400).json({ success: false, message: 'Assignment data invalid chhe.' })
        }
        const a = parsed ?? {}
        const scope = a.scope ?? 'all'
        if (!ASSIGN_SCOPES.includes(scope)) {
            return response.status(400).json({ success: false, message: 'Assignment scope invalid chhe.' })
        }

        let mediaUrl: string | null = null
        let mediaPublicId: string | null = null
        let thumbnailUrl: string | null = null
        let thumbnailPublicId: string | null = null

        const uploaded = Object.values(request.allFiles()).flat()[0]
        if (uploaded) {
            if (!uploaded.isValid) {
                return response.status(400).json({
                    success: false,
                    message: uploaded.errors[0]?.message || 'Invalid media file.',
                })
            }
            try {
                const result = await cloudinary.uploader.upload(uploaded.tmpPath!, {
                    folder: 'gurukul/lessons',
                    resource_type: 'auto',
                })
                mediaUrl = result.secure_url
                mediaPublicId = result.public_id
            } catch (error: any) {
                return response.status(500).json({
                    success: false,
                    message: error.message || 'Media upload karva ma error aavi.',
                })
            }

            if (lesson_type === 'audio') {
                try {
                    const imageBuffer = await new GeminiThumbnailService().generateFromAudio(
                        uploaded.tmpPath!,
                        `${uploaded.type}/${uploaded.subtype}`,
                        String(lesson_title).trim()
                    )

                    if (imageBuffer) {
                        const thumb = await uploadImageBuffer(imageBuffer, 'gurukul/thumbnails')
                        thumbnailUrl = thumb.secure_url
                        thumbnailPublicId = thumb.public_id
                    }
                } catch {
                    thumbnailUrl = null
                    thumbnailPublicId = null
                }
            }
        }

        try {
            const lesson = await Lesson.create({
                lessonTitle: String(lesson_title).trim(),
                lessonType: lesson_type,
                mediaUrl,
                mediaPublicId,
                thumbnailUrl,
                thumbnailPublicId,
                description: description || null,
                departmentId: department_id ? Number(department_id) : null,
                dateStart: start,
                dateEnd: end,
                progressPoints: Number(progress_points) || 50,
                createdBy: Number(user.suid),
                roleCode: user.roleCode,
                assignScope: scope,
                assignDepartmentId: a.departmentId ?? a.department_id ?? null,
                assignSectionId: a.sectionId ?? a.section_id ?? null,
                assignStudentId: a.studentId ?? a.student_id ?? null,
                assignGroupId: a.groupId ?? a.group_id ?? null,
                assignHeadOnly: Boolean(a.headOnly ?? a.head_only ?? false),
            })

            return response
                .status(201)
                .json({ success: true, message: 'Lesson create thai gayu!', data: this.toApi(lesson) })
        } catch (error: any) {
            if (error.code === '23503') {
                return response.status(400).json({
                    success: false,
                    message: 'Select karelu department/section/student/group exist nathi karatu.',
                })
            }
            return response.status(500).json({
                success: false,
                message: error.message || 'Lesson create karva ma error aavi.',
            })
        }
    }

    public async myLessons({ response, auth }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const isHead = HEAD_ROLES.includes(user.roleCode)

            const groupRows = await db
                .from('groups')
                .whereRaw('? = ANY(member_ids)', [String(user.suid)])
                .select('group_id')
            const groupIds: number[] = groupRows.map((g: any) => g.group_id)

            const query = Lesson.query()
                .preload('department')
                .preload('creator')
                .where((q) => {
                    q.where('assign_scope', 'all')
                        .orWhere((d) => {
                            d.where('assign_scope', 'department').where(
                                'assign_department_id',
                                user.departmentId ?? -1
                            )
                        })
                        .orWhere((s) => {
                            s.where('assign_scope', 'section').where('assign_section_id', user.sectionId ?? -1)
                        })
                        .orWhere((st) => {
                            st.where('assign_scope', 'student').where('assign_student_id', String(user.suid))
                        })

                    if (groupIds.length > 0) {
                        q.orWhere((g) => {
                            g.where('assign_scope', 'group').whereIn('assign_group_id', groupIds)
                        })
                    }
                })
                .orderBy('date_start', 'desc')

            if (!isHead) {
                query.where('assign_head_only', false)
            }

            const lessons = await query
            return response.status(200).json({ success: true, data: lessons.map((l) => this.toApi(l)) })
        } catch (error: any) {
            return response.status(500).json({
                success: false,
                message: error.message || 'Lessons fetch karva ma error aavi.',
            })
        }
    }

    public async created({ response, auth }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const lessons = await Lesson.query()
                .where('created_by', String(user.suid))
                .preload('department')
                .preload('creator')
                .orderBy('created_at', 'desc')

            return response.status(200).json({ success: true, data: lessons.map((l) => this.toApi(l)) })
        } catch (error: any) {
            return response.status(500).json({
                success: false,
                message: error.message || 'Lessons fetch karva ma error aavi.',
            })
        }
    }

    public async destroy({ params, response, auth }: HttpContext) {
        const user = auth.getUserOrFail()
        const lessonId = Number(params.id)
        if (!lessonId) {
            return response.status(400).json({ success: false, message: 'Invalid ID' })
        }

        const lesson = await Lesson.find(lessonId)
        if (!lesson) {
            return response.status(404).json({ success: false, message: 'Lesson na madyu.' })
        }

        const isOwner = String(lesson.createdBy) === String(user.suid)
        if (!isOwner && user.roleCode !== 'SUPER_ADMIN') {
            return response
                .status(403)
                .json({ success: false, message: 'Tamne aa lesson delete karvani permission nathi.' })
        }

        try {
            await lesson.delete()
        } catch (error: any) {
            return response.status(500).json({
                success: false,
                message: error.message || 'Lesson delete karva ma error aavi.',
            })
        }

        if (lesson.mediaPublicId) {
            const resourceType =
                lesson.lessonType === 'video' || lesson.lessonType === 'audio'
                    ? 'video'
                    : lesson.lessonType === 'document'
                        ? 'raw'
                        : 'image'
            try {
                await cloudinary.uploader.destroy(lesson.mediaPublicId, { resource_type: resourceType })
            } catch {
                return response.status(200).json({ success: true, message: 'Lesson delete thai gayu.' })
            }
        }

        if (lesson.thumbnailPublicId) {
            try {
                await cloudinary.uploader.destroy(lesson.thumbnailPublicId, { resource_type: 'image' })
            } catch {
                return response.status(200).json({ success: true, message: 'Lesson delete thai gayu.' })
            }
        }

        return response.status(200).json({ success: true, message: 'Lesson delete thai gayu.' })
    }
}