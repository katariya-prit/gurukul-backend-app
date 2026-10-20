import { GoogleGenAI } from '@google/genai'
import { readFile, stat } from 'node:fs/promises'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

const MAX_INLINE_AUDIO_BYTES = 15 * 1024 * 1024
const DEFAULT_TEXT_MODEL = 'gemini-2.5-flash'
const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image'

export default class GeminiThumbnailService {
  private client: GoogleGenAI | null
  private textModel: string
  private imageModel: string

  constructor() {
    const apiKey = env.get('GEMINI_API_KEY')
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null
    this.textModel = env.get('GEMINI_TEXT_MODEL') || DEFAULT_TEXT_MODEL
    this.imageModel = env.get('GEMINI_IMAGE_MODEL') || DEFAULT_IMAGE_MODEL
  }

  async generateFromAudio(
    audioPath: string,
    mimeType: string,
    lessonTitle?: string
  ): Promise<Buffer | null> {
    if (!this.client) {
      logger.warn('GEMINI_API_KEY is not set, skipping thumbnail generation')
      return null
    }

    try {
      const { size } = await stat(audioPath)

      if (size > MAX_INLINE_AUDIO_BYTES) {
        logger.warn({ size }, 'Audio is too large for thumbnail generation')
        return null
      }

      const imagePrompt = await this.buildImagePrompt(audioPath, mimeType, lessonTitle)

      if (!imagePrompt) {
        return null
      }

      return await this.renderImage(imagePrompt)
    } catch (error) {
      logger.error({ err: error }, 'Thumbnail generation failed')
      return null
    }
  }

  private async buildImagePrompt(
    audioPath: string,
    mimeType: string,
    lessonTitle?: string
  ): Promise<string | null> {
    const audioBase64 = (await readFile(audioPath)).toString('base64')

    const instruction = [
      'Listen to this audio lesson.',
      lessonTitle ? `The lesson title is "${lessonTitle}".` : '',
      'Write one detailed prompt for an AI image generator that creates a clean, colorful, educational thumbnail illustrating the main topic of the audio.',
      'The image must not contain any text, letters, numbers, or logos.',
      'Keep the prompt under 80 words.',
      'Reply with the prompt only.',
    ]
      .filter(Boolean)
      .join(' ')

    const response = await this.client!.models.generateContent({
      model: this.textModel,
      contents: [{ text: instruction }, { inlineData: { mimeType, data: audioBase64 } }],
    })

    const prompt = response.text?.trim()
    return prompt || null
  }

  private async renderImage(imagePrompt: string): Promise<Buffer | null> {
    const response = await this.client!.models.generateContent({
      model: this.imageModel,
      contents: imagePrompt,
    })

    const parts = response.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((part) => part.inlineData?.data)

    if (!imagePart?.inlineData?.data) {
      logger.warn('Gemini returned no image data')
      return null
    }

    return Buffer.from(imagePart.inlineData.data, 'base64')
  }
}