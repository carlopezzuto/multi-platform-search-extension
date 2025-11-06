#!/bin/bash

# Build script for Multi-Platform Search Extension
# Creates a clean distribution package with only necessary files

set -e

echo "🔨 Building Multi-Platform Search Extension..."

# Create dist directory
rm -rf dist
mkdir -p dist

# Copy only necessary files for Chrome extension
echo "📦 Copying extension files..."

# Core extension files
cp manifest.json dist/
cp popup.html dist/
cp popup.css dist/
cp popup.js dist/
cp background.js dist/
cp urls.js dist/

# Options page
cp options.html dist/
cp options.css dist/
cp options.js dist/

# Assets
cp icon.png dist/

# Legal
cp LICENSE dist/

echo "✅ Files copied to dist/"

# Create zip file
cd dist
zip -r ../multi-platform-search-extension-v2.0.0.zip .
cd ..

echo "📦 Created: multi-platform-search-extension-v2.0.0.zip"
echo "✨ Build complete!"

# Show what's in the package
echo ""
echo "📋 Package contents:"
unzip -l multi-platform-search-extension-v2.0.0.zip
