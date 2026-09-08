import { describe, expect, it, jest } from '@jest/globals'
import { WAMessageStubType } from '../../Types'
import processMessage from '../../Utils/process-message'
const runGroupStub = async (stubType: number) => {
	const emit = jest.fn()

	const message = {
		key: {
			remoteJid: '120363000000000000@g.us',
			fromMe: false,
			id: 'PHX-TEST',
			participant: '491111111111@s.whatsapp.net'
		},
		messageStubType: stubType,
		messageStubParameters: [
			JSON.stringify({
				id: '222222222222@lid',
				phoneNumber: '492222222222@s.whatsapp.net'
			})
		],
		messageTimestamp: 1
	}

	await processMessage(
		message as any,
		{
			shouldProcessHistoryMsg: false,
			ev: {
				emit
			},
			creds: {
				me: {
					id: '493333333333@s.whatsapp.net'
				}
			},
			signalRepository: {},
			keyStore: {},
			options: {},
			getMessage: async () => undefined
		} as any
	)

	return emit
}

describe('PHX-001 - Group Leave / Remove distinction', () => {
	it('emits leave when a participant voluntarily leaves', async () => {
		const emit = await runGroupStub(
			WAMessageStubType.GROUP_PARTICIPANT_LEAVE
		)

		expect(emit).toHaveBeenCalledWith(
			'group-participants.update',
			expect.objectContaining({
				action: 'leave'
			})
		)
	})

	it('emits remove when a participant is removed', async () => {
		const emit = await runGroupStub(
			WAMessageStubType.GROUP_PARTICIPANT_REMOVE
		)

		expect(emit).toHaveBeenCalledWith(
			'group-participants.update',
			expect.objectContaining({
				action: 'remove'
			})
		)
	})
})