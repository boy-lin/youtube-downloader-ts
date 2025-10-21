# YouTube Download - TypeScript Library

基于 YoutubeDownloader-master 项目实现的 Node.js/TypeScript 版本的 YouTube 视频下载器。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /Users/haolin/Developer/boy-lin/nblog/lib/youtube-download
npm install
```

### 2. 构建项目

```bash
npm run build
```

### 3. 运行示例

```bash
# 运行示例代码
npm run start -- "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# 或者使用 npx
npx youtube-download "dQw4w9WgXcQ" --quality high
```

## 📋 项目结构

```
youtube-download/
├── src/
│   ├── types.ts          # 类型定义
│   ├── resolver.ts       # URL解析和流信息获取
│   ├── downloader.ts     # 视频下载核心逻辑
│   ├── index.ts          # 主导出文件
│   ├── cli.ts            # 命令行接口
│   ├── example.ts         # 使用示例
│   └── __tests__/        # 测试文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── jest.config.js        # 测试配置
├── .eslintrc.js          # 代码规范配置
└── README.md             # 项目文档
```

## 🎯 核心功能

### 1. URL 解析 (`QueryResolver`)

- 支持 YouTube 视频 URL
- 支持视频 ID
- 支持搜索查询（以 `?` 开头）

### 2. 流解析 (`StreamResolver`)

- 获取视频流信息
- 获取音频流信息
- 智能组合音视频流
- 支持多种容器格式

### 3. 视频下载 (`VideoDownloader`)

- 支持进度回调
- 自动错误处理
- 文件大小格式化
- 下载速度计算

### 4. 命令行工具 (`CLI`)

- 丰富的命令行选项
- 彩色输出和进度显示
- 格式列表和信息显示

## 💻 使用方法

### 命令行使用

```bash
# 基本下载
youtube-download "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定质量和格式
youtube-download "VIDEO_ID" --quality high --container mp4

# 仅下载音频
youtube-download "VIDEO_ID" --audio-only --container mp3

# 列出可用格式
youtube-download "VIDEO_ID" --list-formats

# 显示视频信息
youtube-download "VIDEO_ID" --info
```

### 编程使用

```typescript
import YouTubeDownloader, { VideoQuality, Container } from './index'

const downloader = new YouTubeDownloader()

// 解析视频信息
const videos = await downloader.resolveQuery(
  'https://www.youtube.com/watch?v=VIDEO_ID'
)

// 获取下载选项
const options = await downloader.getDownloadOptions(videos[0].id, {
  videoQuality: VideoQuality.High,
  container: Container.MP4
})

// 下载视频
await downloader.downloadVideo(options[0], './video.mp4', progress => {
  console.log(`进度: ${progress.percentage.toFixed(1)}%`)
})
```

## 🔧 开发命令

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint

# 清理构建文件
npm run clean
```

## 📦 依赖说明

### 核心依赖

- `ytdl-core`: YouTube 视频信息获取和流解析
- `commander`: 命令行参数解析
- `chalk`: 终端颜色输出
- `ora`: 加载动画
- `fs-extra`: 文件系统操作

### 开发依赖

- `typescript`: TypeScript 编译器
- `jest`: 测试框架
- `eslint`: 代码检查
- `@types/*`: TypeScript 类型定义

## 🎨 设计特点

1. **模块化设计**: 每个功能模块独立，易于维护和扩展
2. **类型安全**: 完整的 TypeScript 类型定义
3. **错误处理**: 完善的错误处理和恢复机制
4. **进度跟踪**: 实时下载进度和速度显示
5. **灵活配置**: 支持多种质量和格式选项

## 🚧 注意事项

1. **FFmpeg 集成**: 当前版本简化了音视频合并，实际生产环境需要 FFmpeg
2. **搜索功能**: 搜索功能需要额外的实现（ytdl-core 不支持搜索）
3. **字幕支持**: 字幕下载功能需要额外实现
4. **元数据注入**: 媒体标签注入需要额外的库支持

## 🔄 与原始项目的对比

| 功能 | YoutubeDownloader-master | youtube-download   |
| ---- | ------------------------ | ------------------ |
| 平台 | .NET/Avalonia            | Node.js/TypeScript |
| UI   | 图形界面                 | 命令行界面         |
| 语言 | C#                       | TypeScript         |
| 架构 | MVVM                     | 模块化             |
| 依赖 | YoutubeExplode           | ytdl-core          |
| 输出 | 桌面应用                 | 库/CLI 工具        |

这个 TypeScript 版本保持了原始项目的核心功能，同时提供了更适合 Node.js 生态系统的 API 设计。
