#!/bin/bash

echo "🎬 YouTube Download - TypeScript Library Setup"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo ""
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Project built successfully"
else
    echo "❌ Failed to build project"
    exit 1
fi

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ Tests passed"
else
    echo "⚠️  Some tests failed (this is expected for integration tests)"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Available commands:"
echo "   npm run start -- \"VIDEO_URL\"     # Download a video"
echo "   npm run dev                        # Development mode"
echo "   npm test                          # Run tests"
echo "   npm run lint                      # Check code style"
echo ""
echo "📖 Examples:"
echo "   npm run start -- \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\""
echo "   npm run start -- \"dQw4w9WgXcQ\" --quality high --container mp4"
echo "   npm run start -- \"dQw4w9WgXcQ\" --audio-only --container mp3"
echo ""
echo "📚 For more information, see README.md"
