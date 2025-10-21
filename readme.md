# YouTube Downloader TS

A powerful TypeScript library and CLI tool for downloading YouTube videos with advanced stream resolution and flexible download options.

[![npm version](https://badge.fury.io/js/youtube-downloader-ts.svg)](https://badge.fury.io/js/youtube-downloader-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/youtube-downloader-ts.svg)](https://nodejs.org/)

## ✨ Features

- 🎥 **Video & Audio Download**: Download videos in various qualities and formats
- 🎵 **Audio-Only Mode**: Extract audio tracks in MP3, M4A, WebM, or OGG formats
- 🔧 **Flexible Quality Options**: Choose from lowest to highest quality settings
- 📱 **Multiple URL Formats**: Support for standard URLs, short URLs, and escaped URLs
- 🚀 **CLI Tool**: Easy-to-use command-line interface
- 📦 **TypeScript Support**: Full type definitions and IntelliSense support
- 🔄 **Automatic Muxing**: Seamless video and audio stream combination using FFmpeg

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI usage
npm install -g youtube-downloader-ts

# Or install as a dependency
npm install youtube-downloader-ts
```

### CLI Usage

```bash
# Download a video (highest quality, MP4 format)
yt-dl-ts "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Download audio only (MP3 format)
yt-dl-ts "dQw4w9WgXcQ" --audio-only --container mp3

# Specify quality and output file
yt-dl-ts "dQw4w9WgXcQ" --quality medium --output my_video.mp4

# Download in WebM format
yt-dl-ts "dQw4w9WgXcQ" --container webm

# Show help
yt-dl-ts --help
```

### Programmatic Usage

```typescript
import { downloadByUrlOrId } from 'youtube-downloader-ts'

// Download video
const outputPath = await downloadByUrlOrId(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'video.mp4',
  {
    container: 'mp4',
    audioOnly: false,
    quality: 'highest'
  }
)

console.log(`Downloaded to: ${outputPath}`)
```

## 📋 CLI Options

| Option         | Description         | Values                                       | Default        |
| -------------- | ------------------- | -------------------------------------------- | -------------- |
| `--audio-only` | Download audio only | -                                            | `false`        |
| `--container`  | Container format    | `mp4`, `webm`, `mp3`, `ogg`                  | `mp4`          |
| `--quality`    | Video quality       | `lowest`, `low`, `medium`, `high`, `highest` | `highest`      |
| `--output`     | Output file path    | `<path>`                                     | Auto-generated |
| `--help`, `-h` | Show help message   | -                                            | -              |

## 🎯 Supported URL Formats

- **Standard YouTube URLs**: `https://www.youtube.com/watch?v=VIDEO_ID`
- **Escaped URLs**: `https://www.youtube.com/watch\?v\=VIDEO_ID`
- **Short URLs**: `https://youtu.be/VIDEO_ID`
- **Video IDs**: `VIDEO_ID`

## 📦 API Reference

### `downloadByUrlOrId(input, output?, preferences?)`

Downloads a YouTube video or audio.

**Parameters:**

- `input` (string): YouTube URL or video ID
- `output` (string, optional): Output file path
- `preferences` (DownloadPref, optional): Download preferences

**Returns:** Promise<string> - Path to downloaded file

**DownloadPref Interface:**

```typescript
interface DownloadPref {
  container?: 'mp4' | 'webm' | 'mp3' | 'ogg'
  audioOnly?: boolean
  quality?: 'lowest' | 'low' | 'medium' | 'high' | 'highest'
}
```

## 🛠️ Development

### Prerequisites

- Node.js >= 16.0.0
- FFmpeg (for video/audio muxing)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd youtube-downloader-ts

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link
```

### Available Scripts

```bash
npm run build    # Build TypeScript to JavaScript
npm run dev      # Build in watch mode
npm run test     # Run tests
npm run lint     # Run ESLint
npm run clean    # Clean build files
```

## 🏗️ Project Structure

```
src/
├── index.ts              # CLI entry point
├── downloader.ts          # Core download logic
├── types/
│   └── global.d.ts       # Global type definitions
└── utils/
    └── ffmpeg.ts         # FFmpeg integration
```

## 🔧 Requirements

- **Node.js**: >= 16.0.0
- **FFmpeg**: Required for video/audio muxing
  - Install FFmpeg and ensure it's available in your PATH
  - Download from [FFmpeg.org](https://ffmpeg.org/download.html)

## 📝 Examples

### Download High-Quality Video

```bash
yt-dl-ts "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --quality high --output rickroll.mp4
```

### Extract Audio Only

```bash
yt-dl-ts "dQw4w9WgXcQ" --audio-only --container mp3 --output song.mp3
```

### Download with Custom Quality

```bash
yt-dl-ts "youtu.be/dQw4w9WgXcQ" --quality medium --container webm
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. Users are responsible for ensuring they have the right to download content.

## 🙏 Acknowledgments

- Inspired by various YouTube downloader projects
- Built with TypeScript and Node.js
- Uses FFmpeg for video processing

---

**Made with ❤️ for the developer community**
