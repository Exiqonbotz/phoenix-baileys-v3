import { Boom } from '@hapi/boom'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import { isAbsolute, resolve } from 'path'
import { proto } from '../../WAProto/index.js'
import type { WAMessageContent, XHtmlMessageOptions, XHtmlSoundSource } from '../Types'

const HTML_PRIMITIVE_TYPENAME = 'GenAIaeacdsnwHtmlPrimitive'
const SECTION_TYPENAME = 'GenAIUnifiedResponseSection'
const VIEW_MODEL_TYPENAME = 'GenAISingleLayoutViewModel'

const loadSoundBase64 = async (source: XHtmlSoundSource) => {
	if (Buffer.isBuffer(source)) {
		return source.toString('base64')
	}

	const sourcePath = String(source || '')
	if (!sourcePath) {
		throw new Boom('xhtml sound source cannot be empty', { statusCode: 400 })
	}

	if (/^https?:\/\//i.test(sourcePath)) {
		throw new Boom('xhtml sound sources must be local files or Buffers', { statusCode: 400 })
	}

	const absolutePath = isAbsolute(sourcePath) ? sourcePath : resolve(process.cwd(), sourcePath)
	return (await fs.readFile(absolutePath)).toString('base64')
}

const getAutoplayId = (autoplay: XHtmlMessageOptions['autoplay'], sounds: Record<string, string>) => {
	if (autoplay === true) {
		return sounds.default ? 'default' : Object.keys(sounds)[0] || null
	}

	return typeof autoplay === 'string' && autoplay ? autoplay : null
}

const buildSoundScript = (
	sounds: Record<string, string>,
	volume: number,
	loop: boolean,
	autoplay: XHtmlMessageOptions['autoplay']
) => {
	const autoId = getAutoplayId(autoplay, sounds)

	return `<script>
(function(){
  var SOUNDS = ${JSON.stringify(sounds)};
  var vol = ${JSON.stringify(volume)};
  var defaultLoop = ${loop ? 'true' : 'false'};
  var autoId = ${JSON.stringify(autoId)};
  var ctx = null;
  var decoded = {};
  var current = {};

  function b64ToAB(s){
    var bin = atob(s), n = bin.length, u = new Uint8Array(n);
    for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }

  function ensureCtx(){
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function stop(id){
    try {
      if (id) {
        if (current[id]) { current[id].stop(0); delete current[id]; }
      } else {
        Object.keys(current).forEach(function(k){
          try { current[k].stop(0); } catch(e) {}
        });
        current = {};
      }
    } catch(e) {}
  }

  function start(id, buffer, shouldLoop){
    var c = ensureCtx();
    stop(id);
    var src = c.createBufferSource();
    var gain = c.createGain();
    gain.gain.value = vol;
    src.buffer = buffer;
    src.loop = !!shouldLoop;
    src.connect(gain);
    gain.connect(c.destination);
    src.start(0);
    current[id] = src;
    src.onended = function(){ if (current[id] === src) delete current[id]; };
  }

  function play(id, opts){
    id = id || 'default';
    var b64 = SOUNDS[id];
    if (!b64) return;
    opts = opts || {};
    var shouldLoop = opts.loop != null ? !!opts.loop : defaultLoop;
    try {
      ensureCtx();
      if (decoded[id]) { start(id, decoded[id], shouldLoop); return; }
      ctx.decodeAudioData(b64ToAB(b64), function(buffer){
        decoded[id] = buffer;
        start(id, buffer, shouldLoop);
      }, function(){});
    } catch(e) {}
  }

  window.play = play;
  window.stopSound = stop;

  function boot(){
    if (autoId && SOUNDS[autoId]) play(autoId);
  }

  if (autoId) {
    boot();
    setTimeout(boot, 50);
    setTimeout(boot, 200);
    setTimeout(boot, 500);
    document.body.addEventListener('touchstart', boot, { passive: true });
    document.body.addEventListener('click', boot);
  }
})();
</script>`
}

const injectSoundScript = (html: string, script: string) => {
	if (/<\/body>/i.test(html)) {
		return html.replace(/<\/body>/i, `${script}</body>`)
	}

	if (/<\/html>/i.test(html)) {
		return html.replace(/<\/html>/i, `${script}</html>`)
	}

	if (/<html/i.test(html)) {
		return `${html}${script}`
	}

	return `<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${html}${script}</body></html>`
}

export const generateXHtmlMessageContent = async (options: XHtmlMessageOptions): Promise<WAMessageContent> => {
	const html = String(options.html || '').trim()
	if (!html) {
		throw new Boom('xhtml.html is required', { statusCode: 400 })
	}

	const soundSources: Record<string, XHtmlSoundSource> = { ...(options.sounds || {}) }
	if (options.sound) {
		soundSources.default = options.sound
	}

	const sounds: Record<string, string> = {}
	for (const [id, source] of Object.entries(soundSources)) {
		if (!id) {
			continue
		}

		sounds[id] = await loadSoundBase64(source)
	}

	const rawVolume = Number(options.volume ?? 1)
	const volume = Number.isFinite(rawVolume) ? Math.min(1, Math.max(0, rawVolume)) : 1
	const payload = Object.keys(sounds).length
		? injectSoundScript(html, buildSoundScript(sounds, volume, options.loop === true, options.autoplay))
		: html
	const responseId = randomUUID()
	const unifiedResponse = {
		response_id: responseId,
		sections: [
			{
				__typename: SECTION_TYPENAME,
				view_model: {
					__typename: VIEW_MODEL_TYPENAME,
					primitive: {
						__typename: HTML_PRIMITIVE_TYPENAME,
						trusted_sources: [],
						payload
					}
				}
			}
		]
	}

	return proto.Message.create({
		messageContextInfo: {
			botMetadata: {
				botResponseId: responseId
			}
		},
		botForwardedMessage: {
			message: {
				richResponseMessage: {
					messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
					submessages: [
						{
							messageType: proto.AIRichResponseSubMessageType.AI_RICH_RESPONSE_TEXT,
							messageText: ''
						}
					],
					contextInfo: {
						isForwarded: true,
						forwardingScore: 1,
						forwardOrigin: 4
					},
					unifiedResponse: {
						data: Buffer.from(JSON.stringify(unifiedResponse), 'utf8')
					}
				}
			}
		}
	})
}
