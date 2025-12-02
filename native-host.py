#!/usr/bin/env python3
"""
Native messaging host for Chext Chrome extension.
Receives element data from the extension and writes it to /tmp/chext.log
"""

import sys
import json
import struct
import os
from datetime import datetime

# Log file path
LOG_FILE = "/tmp/chext.log"

def send_message(message):
    """
    Send a message to the Chrome extension.
    Messages are sent as: [4 bytes length][message bytes]
    """
    encoded_message = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('I', len(encoded_message)))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.buffer.flush()

def read_message():
    """
    Read a message from the Chrome extension.
    Messages are received as: [4 bytes length][message bytes]
    """
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None

    message_length = struct.unpack('I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def write_to_log(data):
    """Write the text string to the log file."""
    try:
        with open(LOG_FILE, 'a') as f:
            # Write only the text string
            text = data.get('text', '')
            if text:
                f.write(text + '\n')
                f.flush()

        return True
    except Exception as e:
        # Log errors to stderr
        sys.stderr.write(f"Error writing to log: {str(e)}\n")
        sys.stderr.flush()
        return False

def main():
    """Main loop for the native messaging host."""
    # Log startup
    sys.stderr.write("Chext native host started\n")
    sys.stderr.flush()

    # Create log file if it doesn't exist
    if not os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'w') as f:
                f.write(f"# Chext log file created at {datetime.now().isoformat()}\n")
        except Exception as e:
            sys.stderr.write(f"Error creating log file: {str(e)}\n")
            sys.stderr.flush()

    # Main message loop
    while True:
        try:
            message = read_message()
            if message is None:
                break

            # Write to log file
            success = write_to_log(message)

            # Send response back to extension
            send_message({
                'status': 'success' if success else 'error',
                'logged': success
            })

        except Exception as e:
            sys.stderr.write(f"Error in main loop: {str(e)}\n")
            sys.stderr.flush()
            send_message({
                'status': 'error',
                'message': str(e)
            })

if __name__ == '__main__':
    main()
