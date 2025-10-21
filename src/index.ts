#!/usr/bin/env node

import { downloadByUrlOrId } from './downloader'

type DownloadPref = {
  container?: 'mp4' | 'webm' | 'mp3' | 'ogg'
  audioOnly?: boolean
  quality?: 'lowest' | 'low' | 'medium' | 'high' | 'highest'
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('YouTube Downloader CLI')
    console.log('')
    console.log('Usage: yt-dl-ts <url_or_id> [options]')
    console.log('')
    console.log('Options:')
    console.log('  --audio-only              Download audio only')
    console.log(
      '  --container <format>      Container format: mp4, webm, mp3, ogg (default: mp4)'
    )
    console.log(
      '  --quality <level>        Quality: lowest, low, medium, high, highest (default: highest)'
    )
    console.log('  --output <path>          Output file path')
    console.log('  --help, -h                Show this help message')
    console.log('')
    console.log('Examples:')
    console.log('  yt-dl-ts "https://www.youtube.com/watch?v=dQw4w9WgXcQ"')
    console.log('  yt-dl-ts "dQw4w9WgXcQ" --audio-only --container mp3')
    console.log('  yt-dl-ts "dQw4w9WgXcQ" --quality medium --output video.mp4')
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1)
  }

  const input = args[0]
  let audioOnly = false
  let container: DownloadPref['container'] = 'mp4'
  let quality: NonNullable<DownloadPref['quality']> = 'highest'
  let output: string | undefined

  for (let i = 1; i < args.length; i++) {
    const a = args[i]
    if (a === '--audio-only') audioOnly = true
    else if (a === '--container') {
      container = args[++i] as any
    } else if (a === '--quality') {
      quality = args[++i] as any
    } else if (a === '--output') {
      output = args[++i]
    }
  }

  try {
    const out = await downloadByUrlOrId(input, output, {
      audioOnly,
      container,
      quality
    })
    console.log(`Saved: ${out}`)
  } catch (e: any) {
    console.error('Error:', e?.message || e)
    process.exit(2)
  }
}

if (require.main === module) {
  main()
}
