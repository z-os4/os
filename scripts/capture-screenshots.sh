#!/bin/bash
# Screenshot capture script for zOS apps
# Usage: ./scripts/capture-screenshots.sh <app-name> <screenshot-name>
#
# Example:
#   ./scripts/capture-screenshots.sh calculator main
#   ./scripts/capture-screenshots.sh calculator scientific
#   ./scripts/capture-screenshots.sh calculator history

set -e

APP_NAME=$1
SCREENSHOT_NAME=$2

if [ -z "$APP_NAME" ] || [ -z "$SCREENSHOT_NAME" ]; then
  echo "Usage: $0 <app-name> <screenshot-name>"
  echo "Example: $0 calculator main"
  exit 1
fi

# Configuration
SCREENSHOT_DIR="../zos-apps/${APP_NAME}/screenshots"
DIMENSIONS="1280x800"
THUMBNAIL_DIMENSIONS="320x200"

# Create directory if it doesn't exist
mkdir -p "$SCREENSHOT_DIR"

echo "📸 Capture screenshot for ${APP_NAME}/${SCREENSHOT_NAME}"
echo "   Click on the window you want to capture..."

# Capture window screenshot (macOS)
TEMP_FILE="/tmp/screenshot_temp.png"
screencapture -w -o "$TEMP_FILE"

if [ ! -f "$TEMP_FILE" ]; then
  echo "❌ Screenshot capture cancelled"
  exit 1
fi

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
  # Resize to standard dimensions
  convert "$TEMP_FILE" -resize "${DIMENSIONS}^" -gravity center -extent "${DIMENSIONS}" \
    "$SCREENSHOT_DIR/${SCREENSHOT_NAME}.png"

  # Generate thumbnail
  convert "$TEMP_FILE" -resize "${THUMBNAIL_DIMENSIONS}^" -gravity center -extent "${THUMBNAIL_DIMENSIONS}" \
    "$SCREENSHOT_DIR/${SCREENSHOT_NAME}-thumb.png"

  echo "✅ Saved: $SCREENSHOT_DIR/${SCREENSHOT_NAME}.png"
  echo "✅ Saved: $SCREENSHOT_DIR/${SCREENSHOT_NAME}-thumb.png"
else
  # Just copy if ImageMagick not available
  cp "$TEMP_FILE" "$SCREENSHOT_DIR/${SCREENSHOT_NAME}.png"
  echo "✅ Saved: $SCREENSHOT_DIR/${SCREENSHOT_NAME}.png"
  echo "⚠️  Install ImageMagick for automatic resizing: brew install imagemagick"
fi

# Clean up
rm -f "$TEMP_FILE"

echo ""
echo "📋 Add to package.json zos.screenshots:"
echo ""
echo '"screenshots": {'
echo '  "hero": "screenshots/hero.png",'
echo '  "images": ['
echo "    \"screenshots/${SCREENSHOT_NAME}.png\""
echo '  ]'
echo '}'
