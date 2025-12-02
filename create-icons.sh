#!/bin/bash
# Script to create placeholder icons using ImageMagick

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it to create icons:"
    echo "  sudo apt-get install imagemagick"
    exit 1
fi

# Create icon directory if it doesn't exist
mkdir -p icons

# Create 128x128 icon
convert -size 128x128 xc:none -fill "#4285F4" -draw "circle 64,64 64,10" \
        -fill white -pointsize 72 -gravity center -annotate +0+0 "C" \
        icon128.png

# Create 48x48 icon
convert -size 48x48 xc:none -fill "#4285F4" -draw "circle 24,24 24,4" \
        -fill white -pointsize 28 -gravity center -annotate +0+0 "C" \
        icon48.png

# Create 16x16 icon
convert -size 16x16 xc:none -fill "#4285F4" -draw "circle 8,8 8,2" \
        -fill white -pointsize 10 -gravity center -annotate +0+0 "C" \
        icon16.png

echo "Icons created successfully!"
