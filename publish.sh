#!/bin/bash

# Publish script for youtube-downloader-ts
# This script temporarily renames files that shouldn't be published

echo "🚀 Preparing for npm publish..."

# Clean and build
echo "📦 Building project..."
npm run clean
npm run build

# Publish
echo "📤 Publishing to npm..."
npm publish

# Restore files
echo "🔄 Restoring files..."

echo "✅ Publish completed!"
