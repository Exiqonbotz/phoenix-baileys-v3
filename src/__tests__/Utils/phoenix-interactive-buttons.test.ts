import { describe, expect, it } from '@jest/globals'
import { generateWAMessageContent } from '../../Utils/messages'

describe('PHX-002 - Interactive Buttons', () => {
	it('generates single_select and cta_url native flow buttons', async () => {
		const message = await generateWAMessageContent(
			{
				text: 'Phoenix Menu',
				footer: 'Vivere diu Phoenix',
				interactiveButtons: [
					{
						name: 'single_select',
						buttonParamsJson: {
							title: 'Select menu',
							sections: [
								{
									title: 'Phoenix',
									rows: [
										{
											header: 'Menu',
											title: 'Main Menu',
											id: '/menu'
										}
									]
								}
							]
						}
					},
					{
						name: 'cta_url',
						buttonParamsJson: {
							display_text: 'Phoenix Website',
							url: 'https://phoenixgermany.com',
							merchant_url: 'https://phoenixgermany.com'
						}
					}
				]
			} as any,
			{} as any
		)

		const interactive =
			message.viewOnceMessage?.message?.interactiveMessage

		expect(interactive).toBeDefined()
		expect(interactive?.body?.text).toBe('Phoenix Menu')
		expect(interactive?.footer?.text).toBe('Vivere diu Phoenix')

		const buttons = interactive?.nativeFlowMessage?.buttons

		expect(buttons).toHaveLength(2)

		expect(buttons?.[0]?.name).toBe('single_select')
		expect(buttons?.[1]?.name).toBe('cta_url')

		expect(typeof buttons?.[0]?.buttonParamsJson).toBe('string')
		expect(typeof buttons?.[1]?.buttonParamsJson).toBe('string')

		expect(
			JSON.parse(buttons?.[0]?.buttonParamsJson || '{}')
		).toEqual({
			title: 'Select menu',
			sections: [
				{
					title: 'Phoenix',
					rows: [
						{
							header: 'Menu',
							title: 'Main Menu',
							id: '/menu'
						}
					]
				}
			]
		})

		expect(
			JSON.parse(buttons?.[1]?.buttonParamsJson || '{}')
		).toEqual({
			display_text: 'Phoenix Website',
			url: 'https://phoenixgermany.com',
			merchant_url: 'https://phoenixgermany.com'
		})
	})

	it('preserves mentions in the interactive message context', async () => {
		const jid = '491234567890@s.whatsapp.net'

		const message = await generateWAMessageContent(
			{
				text: 'Hello @491234567890',
				mentions: [jid],
				interactiveButtons: [
					{
						name: 'cta_url',
						buttonParamsJson: {
							display_text: 'Phoenix',
							url: 'https://phoenixgermany.com'
						}
					}
				]
			} as any,
			{} as any
		)

		const interactive =
			message.viewOnceMessage?.message?.interactiveMessage

		expect(interactive?.contextInfo?.mentionedJid).toEqual([jid])
	})
})