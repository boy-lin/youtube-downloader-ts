import https from 'https'
import http from 'http'
import type { IncomingMessage as HttpIncomingMessage } from 'http'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { muxWithFfmpeg } from './utils/ffmpeg'

type Stream = {
  itag: number
  mimeType: string
  bitrate?: number
  averageBitrate?: number
  width?: number
  height?: number
  qualityLabel?: string
  audioQuality?: string
  contentLength?: string
  url?: string
  signatureCipher?: string
  approxDurationMs?: string
}

type PlayerResponse = {
  videoDetails?: {
    videoId: string
    title: string
    author: string
    lengthSeconds: string
    viewCount?: string
  }
  streamingData?: {
    expiresInSeconds?: string
    formats?: Stream[]
    adaptiveFormats?: Stream[]
  }
}

type Chosen = {
  video?: Stream
  audio?: Stream
  container: 'mp4' | 'webm' | 'mp3' | 'ogg'
  isAudioOnly: boolean
  title: string
  id: string
}

function parseVideoId(input: string): string {
  // First, unescape any escaped characters that might come from shell escaping
  const unescaped = input.replace(/\\(.)/g, '$1')

  // Try to match standard YouTube URL format
  const idMatch = unescaped.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (idMatch) return idMatch[1]

  // Try to match escaped format (from shell escaping)
  const escapedMatch = input.match(/[?&]v\\=([a-zA-Z0-9_-]{11})/)
  if (escapedMatch) return escapedMatch[1]

  // Check if it's just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input

  // Try YouTube short URL format
  const short = unescaped.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (short) return short[1]

  // Try escaped YouTube short URL format
  const escapedShort = input.match(/youtu\.be\\\/([a-zA-Z0-9_-]{11})/)
  if (escapedShort) return escapedShort[1]

  throw new Error('Invalid YouTube URL or video id')
}

type Cookie = { name: string; value: string; domain?: string; path?: string }
const cookieJar: Cookie[] = []

function setResponseCookies(res: HttpIncomingMessage) {
  const setCookie = res.headers['set-cookie']
  if (!setCookie) return
  for (const raw of setCookie) {
    const [pair, ...attrs] = raw.split(';')
    const [name, value] = pair.split('=')
    if (!name) continue
    const cookie: Cookie = { name: name.trim(), value: (value || '').trim() }
    for (const a of attrs) {
      const [k, v] = a.split('=')
      const key = (k || '').trim().toLowerCase()
      if (key === 'domain') cookie.domain = (v || '').trim()
      if (key === 'path') cookie.path = (v || '').trim()
    }
    // upsert
    const idx = cookieJar.findIndex(c => c.name === cookie.name)
    if (idx >= 0) cookieJar[idx] = cookie
    else cookieJar.push(cookie)
  }
}

function getCookieHeader(): string | undefined {
  if (!cookieJar.length) return undefined
  return cookieJar.map(c => `${c.name}=${c.value}`).join('; ')
}

function get(url: string, referer?: string): Promise<Buffer> {
  console.log('Getting URL:', url)
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const headers: Record<string, string> = {
      'user-agent':
        'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)',
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      connection: 'keep-alive',
      origin: 'https://www.youtube.com',
      referer: referer || 'https://www.youtube.com/'
    }
    const cookieHeader = getCookieHeader()
    if (cookieHeader) headers.cookie = cookieHeader
    const req = client.get(
      url,
      {
        headers
      },
      res => {
        setResponseCookies(res)
        if ((res.statusCode || 0) >= 300 && res.headers.location) {
          get(new URL(res.headers.location, url).toString())
            .then(resolve)
            .catch(reject)
          return
        }
        if ((res.statusCode || 0) !== 200) {
          reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`))
          return
        }

        let stream: NodeJS.ReadableStream = res
        const enc = (res.headers['content-encoding'] || '').toString()
        if (enc.includes('br')) stream = res.pipe(zlib.createBrotliDecompress())
        else if (enc.includes('gzip')) stream = res.pipe(zlib.createGunzip())
        else if (enc.includes('deflate'))
          stream = res.pipe(zlib.createInflate())

        const chunks: Buffer[] = []
        stream.on('data', c =>
          chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c))
        )
        stream.on('end', () => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
      }
    )
    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy(new Error('request timeout'))
    })
  })
}

function post(url: string, json: any, referer?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const isHttps = u.protocol === 'https:'
    const headers: Record<string, string> = {
      'user-agent':
        'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)',
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      origin: 'https://www.youtube.com',
      referer: referer || 'https://www.youtube.com/'
    }
    const cookieHeader = getCookieHeader()
    if (cookieHeader) headers.cookie = cookieHeader

    const opts: any = {
      method: 'POST',
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers
    }
    const body = Buffer.from(JSON.stringify(json))
    headers['content-length'] = String(body.length)

    const req = (isHttps ? https : http).request(opts, res => {
      setResponseCookies(res)
      if ((res.statusCode || 0) >= 300 && res.headers.location) {
        post(new URL(res.headers.location, url).toString(), json, referer)
          .then(resolve)
          .catch(reject)
        return
      }
      if ((res.statusCode || 0) !== 200) {
        reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy(new Error('request timeout'))
    })
    req.write(body)
    req.end()
  })
}

async function getVisitorData(): Promise<string> {
  const buf = await get('https://www.youtube.com/sw.js_data')
  let jsonStr = buf.toString('utf8')
  if (jsonStr.startsWith(")]}'")) jsonStr = jsonStr.slice(4)
  const json = JSON.parse(jsonStr)
  return json[0][2][0][0][13]
}

async function fetchPlayerResponse(videoId: string): Promise<PlayerResponse> {
  // Try IOS client first (no signature required)
  try {
    const visitorData = await getVisitorData()
    const payload = {
      videoId,
      contentCheckOk: true,
      context: {
        client: {
          clientName: 'IOS',
          clientVersion: '19.45.4',
          deviceMake: 'Apple',
          deviceModel: 'iPhone16,2',
          platform: 'MOBILE',
          osName: 'IOS',
          osVersion: '18.1.0.22B83',
          visitorData,
          hl: 'en',
          gl: 'US',
          utcOffsetMinutes: 0
        }
      }
    }
    const buf = await post(
      'https://www.youtube.com/youtubei/v1/player',
      payload
    )
    const pr = JSON.parse(buf.toString('utf8'))
    if (pr && pr.videoDetails) return pr
  } catch (e) {
    console.log('IOS client failed, trying fallback:', e)
  }

  // Fallback: TVHTML5_SIMPLY_EMBEDDED_PLAYER (requires signature)
  try {
    const visitorData = await getVisitorData()
    const payload = {
      videoId,
      context: {
        client: {
          clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER',
          clientVersion: '2.0',
          visitorData,
          hl: 'en',
          gl: 'US',
          utcOffsetMinutes: 0
        },
        thirdParty: {
          embedUrl: 'https://www.youtube.com'
        }
      }
    }
    const buf = await post(
      'https://www.youtube.com/youtubei/v1/player',
      payload
    )
    const pr = JSON.parse(buf.toString('utf8'))
    if (pr && pr.videoDetails) return pr
  } catch (e) {
    console.log('TVHTML5 client failed:', e)
  }

  // Last resort: parse from watch page
  const url = `https://www.youtube.com/watch?v=${videoId}&hl=en`
  const html = (await get(url, url)).toString('utf8')

  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s,
    /var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m) {
      try {
        return JSON.parse(m[1])
      } catch {
        // continue
      }
    }
  }
  throw new Error('Failed to extract player response (page layout changed?)')
}

/**
 * Extract player JS URL using YoutubeExplode method
 */
async function getPlayerJsUrl(): Promise<string> {
  const iframe = (await get('https://www.youtube.com/iframe_api')).toString(
    'utf8'
  )
  const versionMatch = iframe.match(/player\\?\/([0-9a-fA-F]{8})\\?\//)
  if (!versionMatch) throw new Error('Failed to extract player version')
  const version = versionMatch[1]
  return `https://www.youtube.com/s/player/${version}/player_ias.vflset/en_US/base.js`
}

type DecipherAction = {
  type: 'reverse' | 'slice' | 'swap'
  arg?: number
  key?: string
}

/**
 * Parse decipher function actions from player JS using YoutubeExplode method
 */
function parseDecipherActions(
  js: string
): { actions: DecipherAction[]; helperObj: string } | null {
  // Extract signature timestamp
  const stsMatch = js.match(/(?:signatureTimestamp|sts):(\d{5})/)
  if (!stsMatch) return null

  // Find cipher callsite
  const callsiteMatch = js.match(
    /[$_\w]+=function\([$_\w]+\){([$_\w]+)=\1\.split\(['"]{2}\);.*?return \1\.join\(['"]{2}\)}/s
  )
  if (!callsiteMatch) return null
  const callsite = callsiteMatch[0]

  // Find cipher container name
  const containerMatch = callsite.match(/([$_\w]+)\.[$_\w]+\([$_\w]+,\d+\)/)
  if (!containerMatch) return null
  const containerName = containerMatch[1]

  // Find cipher definition
  const defMatch = js.match(
    new RegExp(`var ${containerName.replace(/\$/g, '\\$')}={.*?};`, 's')
  )
  if (!defMatch) return null
  const definition = defMatch[0]

  // Identify function names by their implementations
  const swapMatch = definition.match(
    /([$_\w]+):function\([$_\w]+,[$_\w]+\){[^}]*?%[^}]*?}/s
  )
  const spliceMatch = definition.match(
    /([$_\w]+):function\([$_\w]+,[$_\w]+\){[^}]*?splice[^}]*?}/s
  )
  const reverseMatch = definition.match(
    /([$_\w]+):function\([$_\w]+\){[^}]*?reverse[^}]*?}/s
  )

  const swapFunc = swapMatch ? swapMatch[1] : null
  const spliceFunc = spliceMatch ? spliceMatch[1] : null
  const reverseFunc = reverseMatch ? reverseMatch[1] : null

  const actions: DecipherAction[] = []
  for (const statement of callsite.split(';')) {
    const callMatch = statement.match(/[$_\w]+\.([$_\w]+)\([$_\w]+,(\d+)\)/)
    if (!callMatch) continue

    const funcName = callMatch[1]
    const arg = parseInt(callMatch[2], 10)

    if (funcName === swapFunc) {
      actions.push({ type: 'swap', arg })
    } else if (funcName === spliceFunc) {
      actions.push({ type: 'slice', arg })
    } else if (funcName === reverseFunc) {
      actions.push({ type: 'reverse' })
    }
  }

  return actions.length ? { actions, helperObj: containerName } : null
}

function applyDecipherActions(sig: string, actions: DecipherAction[]): string {
  let a = sig.split('')
  for (const act of actions) {
    if (act.type === 'reverse') a = a.reverse()
    else if (act.type === 'slice') a = a.slice(act.arg || 0)
    else if (act.type === 'swap') {
      const pos = (act.arg || 0) % a.length
      const t = a[0]
      a[0] = a[pos]
      a[pos] = t
    }
  }
  return a.join('')
}

/** Parse actions for a given function name (same scheme as signature) */
function parseActionsByName(
  js: string,
  fnName: string
): DecipherAction[] | null {
  const fnBodyMatch = js.match(
    new RegExp(
      fnName.replace(/\$/g, '\\$') + '=function\\(a\\)\\{(.*?)\\}',
      's'
    )
  )
  if (!fnBodyMatch) return null
  const body = fnBodyMatch[1]
  const objMatch = body.match(/([a-zA-Z0-9$]{2})\.[a-zA-Z0-9$]{2}\(a,\d+\)/)
  const helperObj = objMatch ? objMatch[1] : null
  if (!helperObj) return null

  const objBodyMatch = js.match(
    new RegExp(
      'var\\s+' + helperObj.replace(/\$/g, '\\$') + '=\\{(.*?)\\}\\;',
      's'
    )
  )
  const objBody = objBodyMatch ? objBodyMatch[1] : null
  if (!objBody) return null

  const methods: Record<string, 'reverse' | 'slice' | 'swap'> = {}
  objBody.split(/,(?=[a-zA-Z0-9$]{2}:function\()/).forEach(part => {
    const nameMatch = part.match(/^([a-zA-Z0-9$]{2}):function\(a,(b)?\)/)
    const name = nameMatch ? nameMatch[1] : null
    if (!name) return
    if (/a\.reverse\(\)/.test(part)) methods[name] = 'reverse'
    else if (/a\.splice\(0,b\)/.test(part)) methods[name] = 'slice'
    else if (
      /var c=a\[0\];a\[0\]=a\[b%a\.length\];a\[b%a\.length\]=c/.test(part)
    )
      methods[name] = 'swap'
  })

  const callRe = new RegExp(
    helperObj.replace(/\$/g, '\\$') + '\\.([a-zA-Z0-9$]{2})\\(a,(\\d+)\\)',
    'g'
  )
  const actions: DecipherAction[] = []
  let m: RegExpExecArray | null
  while ((m = callRe.exec(body))) {
    const method = methods[m[1]]
    const n = parseInt(m[2], 10)
    if (!method) continue
    if (method === 'reverse') actions.push({ type: 'reverse' })
    else if (method === 'slice') actions.push({ type: 'slice', arg: n })
    else if (method === 'swap') actions.push({ type: 'swap', arg: n })
  }

  return actions.length ? actions : null
}

/** Try to locate the n-transform function name */
function findNFunctionName(js: string): string | null {
  // Look for .get("n") ... fn(
  const m1 = js.match(/\.get\("n"\)[^;\)]{0,200}?([a-zA-Z0-9$]{2})\(/s)
  if (m1 && m1[1]) return m1[1]
  // Alternative pattern: (b=a.get("n")) && (b=fn(b))
  const m2 = js.match(/a\.get\("n"\)\)\s*&&\s*\(b=([a-zA-Z0-9$]{2})\(/)
  if (m2 && m2[1]) return m2[1]
  // Fallback: pick another split/join function different from signature
  const m3 = js.match(
    /([a-zA-Z0-9$]{2})=function\(a\)\{a=a\.split\(""\);.*?return a\.join\(""\)\}/s
  )
  return m3 ? m3[1] : null
}

async function ensureDecipheredUrl(
  stream: Stream,
  htmlCache?: string,
  jsCache?: string
): Promise<string | null> {
  if (stream.url) {
    try {
      const u = new URL(stream.url)
      // If has n, try to decode using player js
      const n = u.searchParams.get('n')
      if (n) {
        const js =
          jsCache || (await get(await getPlayerJsUrl())).toString('utf8')
        const nFn = findNFunctionName(js)
        if (nFn) {
          const actions = parseActionsByName(js, nFn)
          if (actions) {
            const nn = applyDecipherActions(n, actions)
            u.searchParams.set('n', nn)
          }
        }
      }
      u.searchParams.set('ratebypass', 'yes')
      return u.toString()
    } catch {
      return stream.url
    }
  }
  if (!stream.signatureCipher) return null

  const params = new URLSearchParams(stream.signatureCipher)
  const s = params.get('s')
  const url = params.get('url')
  const sp = params.get('sp') || 'sig'
  if (!s || !url) return null

  // Get player js using YoutubeExplode method
  const js = jsCache || (await get(await getPlayerJsUrl())).toString('utf8')
  const parsed = parseDecipherActions(js)
  if (!parsed) return null
  const sig = applyDecipherActions(s, parsed.actions)
  const u = new URL(url)
  u.searchParams.set(sp, sig)
  // n param decode if present
  const n = u.searchParams.get('n')
  if (n) {
    const nFn = findNFunctionName(js)
    if (nFn) {
      const actions = parseActionsByName(js, nFn)
      if (actions) {
        const nn = applyDecipherActions(n, actions)
        u.searchParams.set('n', nn)
      }
    }
  }
  u.searchParams.set('ratebypass', 'yes')
  return u.toString()
}

function chooseStreams(pr: PlayerResponse, pref: DownloadPref): Chosen {
  const title = sanitizeFileName(pr.videoDetails?.title || 'video')
  const id = pr.videoDetails?.videoId || 'unknown'

  const formats = pr.streamingData?.formats || []
  const adaptive = pr.streamingData?.adaptiveFormats || []

  // accept items that either have direct url or signatureCipher
  const availableMuxed = formats.filter(
    f => (f.url || f.signatureCipher) && f.mimeType?.includes('video/')
  )
  const availableVideo = adaptive.filter(
    f => (f.url || f.signatureCipher) && f.mimeType?.includes('video/')
  )
  const availableAudio = adaptive.filter(
    f => (f.url || f.signatureCipher) && f.mimeType?.includes('audio/')
  )

  const wantAudioOnly = !!pref.audioOnly
  const wantContainer = pref.container || 'mp4'
  const wantQuality = pref.quality || 'highest'

  if (wantAudioOnly) {
    const audio = pickBestAudio(availableAudio, wantContainer, wantQuality)
    if (!audio) throw new Error('No direct audio stream available')
    const audioContainer = audio.mimeType?.includes('webm')
      ? 'webm'
      : wantContainer
    return {
      audio,
      container: mapAudioContainer(audioContainer),
      isAudioOnly: true,
      title,
      id
    }
  }

  const muxed = pickBestMuxed(availableMuxed, wantContainer, wantQuality)
  if (muxed) {
    const container = muxed.mimeType?.includes('webm') ? 'webm' : 'mp4'
    return { video: muxed, container, isAudioOnly: false, title, id }
  }

  const video = pickBestVideo(availableVideo, wantContainer, wantQuality)
  const audio = pickBestAudio(availableAudio, wantContainer, wantQuality)
  if (!video || !audio)
    throw new Error('No suitable adaptive streams with direct url')
  const container = video.mimeType?.includes('webm') ? 'webm' : 'mp4'
  return { video, audio, container, isAudioOnly: false, title, id }
}

function qualityRank(label?: string): number {
  if (!label) return 0
  const order = [
    '144p',
    '240p',
    '360p',
    '480p',
    '720p',
    '1080p',
    '1440p',
    '2160p',
    '4320p'
  ]
  const i = order.indexOf(label.toLowerCase())
  return i === -1 ? 0 : i
}
function wantRank(q: DownloadPref['quality']): number {
  const map: Record<string, number> = {
    lowest: 0,
    low: 1,
    medium: 2,
    high: 3,
    highest: 999
  }
  return map[q || 'highest'] ?? 999
}

function pickBestMuxed(
  list: Stream[],
  wantContainer: string,
  wantQuality: NonNullable<DownloadPref['quality']>
): Stream | undefined {
  const target = wantRank(wantQuality)
  const filtered = list.filter(s => s.mimeType?.includes(wantContainer))
  if (filtered.length === 0) return undefined
  return filtered.sort((a, b) => {
    const qa = qualityRank(a.qualityLabel)
    const qb = qualityRank(b.qualityLabel)
    const da = Math.abs(qa - target)
    const db = Math.abs(qb - target)
    return (
      da - db ||
      parseInt(b.contentLength || '0') - parseInt(a.contentLength || '0')
    )
  })[0]
}
function pickBestVideo(
  list: Stream[],
  wantContainer: string,
  wantQuality: NonNullable<DownloadPref['quality']>
): Stream | undefined {
  const target = wantRank(wantQuality)
  const filtered = list.filter(s => s.mimeType?.includes(wantContainer))
  if (filtered.length === 0) return undefined
  return filtered.sort((a, b) => {
    const qa = qualityRank(a.qualityLabel)
    const qb = qualityRank(b.qualityLabel)
    const da = Math.abs(qa - target)
    const db = Math.abs(qb - target)
    return da - db || (b.bitrate || 0) - (a.bitrate || 0)
  })[0]
}
function pickBestAudio(
  list: Stream[],
  wantContainer: string,
  _wantQuality: NonNullable<DownloadPref['quality']>
): Stream | undefined {
  const preferred = list.filter(s => s.mimeType?.includes(wantContainer))
  const candidate = (preferred.length ? preferred : list).sort(
    (a, b) =>
      (b.averageBitrate || b.bitrate || 0) -
      (a.averageBitrate || a.bitrate || 0)
  )[0]
  return candidate
}
function mapAudioContainer(c: string): 'mp4' | 'webm' | 'mp3' | 'ogg' {
  if (c === 'mp3' || c === 'ogg') return c
  if (c === 'webm') return 'webm'
  return 'mp4'
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .slice(0, 100)
}

async function downloadToFile(
  url: string,
  outPath: string,
  referer?: string
): Promise<void> {
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true })
  const client = url.startsWith('https:') ? https : http
  console.log('Downloading to file:', url, outPath)
  await new Promise<void>((resolve, reject) => {
    const req = client.get(
      url,
      {
        headers: {
          'user-agent':
            'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X; US)',
          accept: '*/*',
          connection: 'keep-alive',
          origin: 'https://www.youtube.com',
          referer: referer || 'https://www.youtube.com/',
          range: 'bytes=0-',
          cookie: getCookieHeader()
        }
      },
      res => {
        setResponseCookies(res)
        if ((res.statusCode || 0) >= 300 && res.headers.location) {
          downloadToFile(
            new URL(res.headers.location, url).toString(),
            outPath,
            referer
          )
            .then(resolve)
            .catch(reject)
          return
        }
        if ((res.statusCode || 0) !== 200 && (res.statusCode || 0) !== 206) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }

        const total = parseInt(res.headers['content-length'] || '0')
        let downloaded = 0
        const start = Date.now()

        const ws = fs.createWriteStream(outPath)
        res.on('data', chunk => {
          downloaded += chunk.length
          if (total > 0) {
            const pct = ((downloaded / total) * 100).toFixed(1)
            const elapsed = (Date.now() - start) / 1000
            const speed =
              formatBytes(downloaded / Math.max(elapsed, 0.1)) + '/s'
            process.stdout.write(
              `\rDownloading ${pct}% (${formatBytes(downloaded)}/${formatBytes(
                total
              )}) ${speed}`
            )
          } else {
            process.stdout.write(`\rDownloading ${formatBytes(downloaded)} ...`)
          }
        })
        res.on('end', () => {
          process.stdout.write('\n')
          ws.end()
          resolve()
        })
        res.on('error', err => {
          ws.destroy()
          reject(err)
        })
        res.pipe(ws)
      }
    )
    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy(new Error('request timeout'))
    })
  })
}

function formatBytes(n: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let s = n
  let i = 0
  while (s >= 1024 && i < units.length - 1) {
    s /= 1024
    i++
  }
  return `${s.toFixed(1)} ${units[i]}`
}

export async function downloadByUrlOrId(
  input: string,
  output?: string,
  pref: DownloadPref = {
    container: 'mp4',
    audioOnly: false,
    quality: 'highest'
  }
): Promise<string> {
  console.log('Downloading by URL or ID:', input, output, pref)
  const videoId = parseVideoId(input)
  const pr = await fetchPlayerResponse(videoId)
  const choice = chooseStreams(pr, pref)
  console.log('Choice:', choice)
  const baseName = output
    ? output
    : `${choice.title}.${
        choice.isAudioOnly
          ? choice.container === 'mp4'
            ? 'm4a'
            : choice.container
          : choice.container
      }`
  const outPath = path.resolve(process.cwd(), baseName)
  console.log('outPath', outPath)
  if (choice.isAudioOnly) {
    const audioUrl = await ensureDecipheredUrl(choice.audio!)
    if (!audioUrl) throw new Error('No audio url')
    await downloadToFile(
      audioUrl,
      outPath,
      `https://www.youtube.com/watch?v=${videoId}`
    )
    return outPath
  }

  if (choice.video && !choice.audio) {
    const vUrl = await ensureDecipheredUrl(choice.video)
    if (!vUrl) throw new Error('No muxed url')
    await downloadToFile(
      vUrl,
      outPath,
      `https://www.youtube.com/watch?v=${videoId}`
    )
    return outPath
  }

  const tmpV = path.resolve(
    process.cwd(),
    `.tmp_${choice.id}_v.${choice.container}`
  )
  const tmpA = path.resolve(
    process.cwd(),
    `.tmp_${choice.id}_a.${choice.container === 'webm' ? 'webm' : 'm4a'}`
  )

  const vUrl = await ensureDecipheredUrl(choice.video!)
  const aUrl = await ensureDecipheredUrl(choice.audio!)
  if (!vUrl || !aUrl) throw new Error('Missing stream url')
  await downloadToFile(vUrl, tmpV, `https://www.youtube.com/watch?v=${videoId}`)
  await downloadToFile(aUrl, tmpA, `https://www.youtube.com/watch?v=${videoId}`)
  await muxWithFfmpeg(tmpV, tmpA, outPath)

  try {
    fs.unlinkSync(tmpV)
  } catch {}
  try {
    fs.unlinkSync(tmpA)
  } catch {}

  return outPath
}
