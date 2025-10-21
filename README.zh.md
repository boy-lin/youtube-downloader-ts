# YouTube Downloader TS

一个强大的 TypeScript 库和 CLI 工具，用于下载 YouTube 视频，支持高级流解析和灵活的下载选项。

[![npm version](https://badge.fury.io/js/youtube-downloader-ts.svg)](https://badge.fury.io/js/youtube-downloader-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/youtube-downloader-ts.svg)](https://nodejs.org/)

## ✨ 特性

- 🎥 **视频和音频下载**: 支持多种质量和格式的视频下载
- 🎵 **纯音频模式**: 提取音频轨道，支持 MP3、M4A、WebM 或 OGG 格式
- 🔧 **灵活的质量选项**: 从最低到最高质量设置中选择
- 📱 **多种 URL 格式**: 支持标准 URL、短链接和转义 URL
- 🚀 **CLI 工具**: 易于使用的命令行界面
- 📦 **TypeScript 支持**: 完整的类型定义和 IntelliSense 支持
- 🔄 **自动混流**: 使用 FFmpeg 无缝组合视频和音频流

## 🚀 快速开始

### 安装

```bash
# 全局安装用于 CLI 使用
npm install -g youtube-downloader-ts

# 或作为依赖安装
npm install youtube-downloader-ts
```

### CLI 使用

```bash
# 下载视频（最高质量，MP4 格式）
yt-dl-ts "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# 仅下载音频（MP3 格式）
yt-dl-ts "dQw4w9WgXcQ" --audio-only --container mp3

# 指定质量和输出文件
yt-dl-ts "dQw4w9WgXcQ" --quality medium --output my_video.mp4

# 以 WebM 格式下载
yt-dl-ts "dQw4w9WgXcQ" --container webm

# 显示帮助
yt-dl-ts --help
```

### 编程使用

```typescript
import { downloadByUrlOrId } from 'youtube-downloader-ts'

// 下载视频
const outputPath = await downloadByUrlOrId(
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'video.mp4',
  {
    container: 'mp4',
    audioOnly: false,
    quality: 'highest'
  }
)

console.log(`下载到: ${outputPath}`)
```

## 📋 CLI 选项

| 选项           | 描述         | 可选值                                       | 默认值    |
| -------------- | ------------ | -------------------------------------------- | --------- |
| `--audio-only` | 仅下载音频   | -                                            | `false`   |
| `--container`  | 容器格式     | `mp4`, `webm`, `mp3`, `ogg`                  | `mp4`     |
| `--quality`    | 视频质量     | `lowest`, `low`, `medium`, `high`, `highest` | `highest` |
| `--output`     | 输出文件路径 | `<路径>`                                     | 自动生成  |
| `--help`, `-h` | 显示帮助信息 | -                                            | -         |

## 🎯 支持的 URL 格式

- **标准 YouTube URL**: `https://www.youtube.com/watch?v=VIDEO_ID`
- **转义 URL**: `https://www.youtube.com/watch\?v\=VIDEO_ID`
- **短链接**: `https://youtu.be/VIDEO_ID`
- **视频 ID**: `VIDEO_ID`

## 📦 API 参考

### `downloadByUrlOrId(input, output?, preferences?)`

下载 YouTube 视频或音频。

**参数:**

- `input` (string): YouTube URL 或视频 ID
- `output` (string, 可选): 输出文件路径
- `preferences` (DownloadPref, 可选): 下载偏好设置

**返回值:** Promise<string> - 下载文件的路径

**DownloadPref 接口:**

```typescript
interface DownloadPref {
  container?: 'mp4' | 'webm' | 'mp3' | 'ogg'
  audioOnly?: boolean
  quality?: 'lowest' | 'low' | 'medium' | 'high' | 'highest'
}
```

## 🛠️ 开发

### 前置要求

- Node.js >= 16.0.0
- FFmpeg（用于视频/音频混流）

### 设置

```bash
# 克隆仓库
git clone <repository-url>
cd youtube-downloader-ts

# 安装依赖
npm install

# 构建项目
npm run build

# 本地开发链接
npm link
```

### 可用脚本

```bash
npm run build    # 将 TypeScript 编译为 JavaScript
npm run dev      # 监听模式构建
npm run test     # 运行测试
npm run lint     # 运行 ESLint
npm run clean    # 清理构建文件
```

## 🏗️ 项目结构

```
src/
├── index.ts              # CLI 入口点
├── downloader.ts          # 核心下载逻辑
├── types/
│   └── global.d.ts       # 全局类型定义
└── utils/
    └── ffmpeg.ts         # FFmpeg 集成
```

## 🔧 系统要求

- **Node.js**: >= 16.0.0
- **FFmpeg**: 视频/音频混流必需
  - 安装 FFmpeg 并确保在 PATH 中可用
  - 从 [FFmpeg.org](https://ffmpeg.org/download.html) 下载

## 📝 示例

### 下载高质量视频

```bash
yt-dl-ts "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --quality high --output rickroll.mp4
```

### 仅提取音频

```bash
yt-dl-ts "dQw4w9WgXcQ" --audio-only --container mp3 --output song.mp3
```

### 自定义质量下载

```bash
yt-dl-ts "youtu.be/dQw4w9WgXcQ" --quality medium --container webm
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## ⚠️ 免责声明

此工具仅用于教育目的。请遵守 YouTube 的服务条款和版权法律。用户有责任确保有权下载内容。

## 🙏 致谢

- 受到各种 YouTube 下载器项目的启发
- 使用 TypeScript 和 Node.js 构建
- 使用 FFmpeg 进行视频处理

---

**为开发者社区用心制作 ❤️**
