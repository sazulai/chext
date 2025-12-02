#!/bin/bash
# Installation script for Chext Chrome Extension

set -e

echo "Installing Chext Chrome Extension Native Host..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Native host manifest location for Chrome/Chromium on Linux
NATIVE_HOST_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
CHROMIUM_HOST_DIR="$HOME/.config/chromium/NativeMessagingHosts"

# Create directories if they don't exist
mkdir -p "$NATIVE_HOST_DIR"
mkdir -p "$CHROMIUM_HOST_DIR"

# Make the native host script executable
chmod +x "$SCRIPT_DIR/native-host.py"

echo "Please load the extension in Chrome first to get the Extension ID:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (top right)"
echo "3. Click 'Load unpacked' and select: $SCRIPT_DIR"
echo "4. Copy the Extension ID (it looks like: abcdefghijklmnopqrstuvwxyz123456)"
echo ""
read -p "Enter the Extension ID: " EXTENSION_ID

if [ -z "$EXTENSION_ID" ]; then
    echo "Error: Extension ID cannot be empty"
    exit 1
fi

# Create the native host manifest with the correct extension ID
cat > "$SCRIPT_DIR/com.chext.logger.json" << EOF
{
  "name": "com.chext.logger",
  "description": "Chext element logger native host",
  "path": "$SCRIPT_DIR/native-host.py",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$EXTENSION_ID/"
  ]
}
EOF

# Install the native host manifest
cp "$SCRIPT_DIR/com.chext.logger.json" "$NATIVE_HOST_DIR/"
cp "$SCRIPT_DIR/com.chext.logger.json" "$CHROMIUM_HOST_DIR/"

echo ""
echo "Installation complete!"
echo "Native host manifest installed to:"
echo "  - $NATIVE_HOST_DIR/com.chext.logger.json"
echo "  - $CHROMIUM_HOST_DIR/com.chext.logger.json"
echo ""
echo "The extension will log element data to: /tmp/chext.log"
echo ""
echo "Next steps:"
echo "1. Reload the extension in chrome://extensions/"
echo "2. Navigate to any webpage"
echo "3. Move your mouse over elements to log them"
echo "4. Check /tmp/chext.log for logged data"
echo ""
echo "To uninstall, run: ./uninstall.sh"
