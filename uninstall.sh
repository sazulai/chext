#!/bin/bash
# Uninstallation script for Chext Chrome Extension

echo "Uninstalling Chext Chrome Extension Native Host..."

# Native host manifest locations
NATIVE_HOST_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
CHROMIUM_HOST_DIR="$HOME/.config/chromium/NativeMessagingHosts"

# Remove the native host manifests
rm -f "$NATIVE_HOST_DIR/com.chext.logger.json"
rm -f "$CHROMIUM_HOST_DIR/com.chext.logger.json"

echo "Native host uninstalled."
echo ""
echo "To remove the extension:"
echo "1. Go to chrome://extensions/"
echo "2. Find 'Chext - Element Logger'"
echo "3. Click 'Remove'"
echo ""
echo "The log file at /tmp/chext.log has been preserved."
echo "To remove it manually, run: rm /tmp/chext.log"
