#!/bin/bash
# Test script for the native messaging host

echo "Testing native host..."

# Create a test message with just text
TEST_MESSAGE='{"timestamp":"2025-12-01T00:00:00.000Z","url":"https://test.com","text":"This is a test text string"}'

# Calculate message length
MSG_LENGTH=${#TEST_MESSAGE}

# Send message to native host in Chrome's native messaging format
printf "$(printf '\\x%02x\\x%02x\\x%02x\\x%02x' $((MSG_LENGTH & 0xFF)) $(((MSG_LENGTH >> 8) & 0xFF)) $(((MSG_LENGTH >> 16) & 0xFF)) $(((MSG_LENGTH >> 24) & 0xFF)))$TEST_MESSAGE" | /home/sharon/dev/chext/native-host.py

echo ""
echo "Check /tmp/chext.log for the test entry"
tail -5 /tmp/chext.log
