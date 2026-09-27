import { describe, expect, it } from '@jest/globals'
import type { MessageContentGenerationOptions } from '../../Types'
import { generateWAMessageContent } from '../../Utils/messages'

describe('PHX-003 - XHTML rich messages', () => {
	it('generates the WhatsApp rich-response HTML primitive', async () => {
		const message = await generateWAMessageContent(
			{
				xhtml: {
					html: '<div id="phoenix">Phoenix</div>',
					bypassDownload: false
				}
			},
			{} as MessageContentGenerationOptions
		)

		const richResponse = message.botForwardedMessage?.message?.richResponseMessage
		expect(richResponse?.messageType).toBe(1)
		expect(richResponse?.submessages?.[0]?.messageType).toBe(2)
		expect(richResponse?.contextInfo?.isForwarded).toBe(true)
		expect(richResponse?.unifiedResponse?.data).toBeDefined()

		const unified = JSON.parse(Buffer.from(richResponse?.unifiedResponse?.data || []).toString('utf8'))
		expect(typeof unified.response_id).toBe('string')
		expect(unified.response_id).toBe(message.messageContextInfo?.botMetadata?.botResponseId)
		expect(unified.sections).toEqual([
			{
				__typename: 'GenAIUnifiedResponseSection',
				view_model: {
					__typename: 'GenAISingleLayoutViewModel',
					primitive: {
						__typename: 'GenAIaeacdsnwHtmlPrimitive',
						trusted_sources: [],
						payload: '<div id="phoenix">Phoenix</div>'
					}
				}
			}
		])
	})

	it('embeds named Buffer sounds and exposes play() inside the HTML payload', async () => {
		const message = await generateWAMessageContent(
			{
				xhtml: {
					html: '<html><body><button onclick="play(\'spin\')">Spin</button></body></html>',
					sounds: {
						spin: Buffer.from('phoenix-spin')
					},
					volume: 0.8,
					autoplay: 'spin',
					bypassDownload: false
				}
			},
			{} as MessageContentGenerationOptions
		)

		const data = message.botForwardedMessage?.message?.richResponseMessage?.unifiedResponse?.data
		const unified = JSON.parse(Buffer.from(data || []).toString('utf8'))
		const payload = unified.sections[0].view_model.primitive.payload as string

		expect(payload).toContain(`var SOUNDS = {"spin":"${Buffer.from('phoenix-spin').toString('base64')}"}`)
		expect(payload).toContain('var vol = 0.8')
		expect(payload).toContain('var autoId = "spin"')
		expect(payload).toContain('window.play = play')
		expect(payload.indexOf('<script>')).toBeLessThan(payload.indexOf('</body>'))
	})
})
