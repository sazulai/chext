# Chext - Chrome Element Logger Extension

A Chrome extension that tracks mouse-hovered elements and logs their information to a local file at `/tmp/chext.log`.

## Features

- **Mouse Tracking**: Automatically detects and logs information about elements as you hover over them
- **Click Logging**: Also logs elements when you click on them
- **Detailed Information**: Captures comprehensive element data including:
  - Tag name, ID, and classes
  - Text content
  - Attributes (href, src, alt, title, etc.)
  - XPath location
  - Current page URL
  - Timestamp
- **Local Logging**: Writes all data to `/tmp/chext.log` on your local machine
- **Throttling**: Intelligent throttling to prevent excessive logging

## Architecture

The extension consists of three main components:

1. **Content Script** (`content.js`): Runs on web pages and tracks mouse movements
2. **Background Service Worker** (`background.js`): Handles communication between content script and native host
3. **Native Messaging Host** (`native-host.py`): Python script that writes logs to `/tmp/chext.log`

## Requirements

- Google Chrome or Chromium browser
- Python 3.x
- Linux operating system (paths may need adjustment for macOS/Windows)

## Installation

### Step 1: Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `chext` directory (`/home/sharon/dev/chext`)
5. **Copy the Extension ID** (a long string like `abcdefghijklmnopqrstuvwxyz123456`)

### Step 2: Install the Native Messaging Host

Run the installation script:

```bash
cd /home/sharon/dev/chext
./install.sh
```

The script will:
- Ask you to enter the Extension ID you copied in Step 1
- Create the native messaging host configuration
- Install it to the correct Chrome directories
- Make the native host script executable

### Step 3: Activate the Extension

1. Go back to `chrome://extensions/`
2. Click the **Reload** button on the Chext extension
3. The extension is now active!

## Usage

Once installed and activated:

1. Navigate to any webpage
2. Move your mouse over elements
3. The extension will automatically log information about hovered elements
4. Check the log file:

```bash
tail -f /tmp/chext.log
```

### Log Format

Each log entry is a JSON object with the following structure:

```json
{
  "timestamp": "2025-12-01T12:34:56.789Z",
  "url": "https://example.com/page",
  "element": {
    "tag": "A",
    "id": "link-id",
    "className": "nav-link active",
    "text": "Click here",
    "href": "https://example.com/destination",
    "xpath": "/html/body/div[1]/nav[1]/a[2]",
    "attributes": {
      "data-testid": "navigation-link",
      "aria-label": "Go to page"
    }
  }
}
```

### Viewing Logs

```bash
# View logs in real-time
tail -f /tmp/chext.log

# View recent entries
tail -n 50 /tmp/chext.log

# Search for specific elements
grep '"tag":"BUTTON"' /tmp/chext.log | jq .

# Count logged entries
wc -l /tmp/chext.log
```

## Customization

### Change Log File Location

Edit `native-host.py` and change the `LOG_FILE` variable:

```python
LOG_FILE = "/your/custom/path/chext.log"
```

Then reinstall:

```bash
./install.sh
```

### Adjust Throttling

Edit `content.js` and change the throttle delay (in milliseconds):

```javascript
// Change from 500ms to 1000ms
const throttledLog = throttle(logElement, 1000);
```

### Add More Tracked Attributes

Edit `content.js` in the `getElementInfo` function:

```javascript
const importantAttrs = ['data-testid', 'aria-label', 'role', 'name', 'type', 'your-attribute'];
```

## Troubleshooting

### Extension not logging

1. Check if the native host is connected:
   - Open Developer Tools (F12)
   - Go to the extension's background page: `chrome://extensions/` → Click "service worker"
   - Look for "Connected to native host" message

2. Check native host errors:
   - The native host logs errors to stderr
   - You might see errors in the background service worker console

3. Verify the native host manifest:
   ```bash
   cat ~/.config/google-chrome/NativeMessagingHosts/com.chext.logger.json
   ```
   - Ensure the Extension ID matches
   - Ensure the path to `native-host.py` is correct

### Permission denied on log file

```bash
# Make sure /tmp is writable
touch /tmp/test-write && rm /tmp/test-write

# Check log file permissions
ls -la /tmp/chext.log
```

### Native host not found

Make sure the native host manifest is installed in the correct location:

- Chrome: `~/.config/google-chrome/NativeMessagingHosts/`
- Chromium: `~/.config/chromium/NativeMessagingHosts/`

## Uninstallation

```bash
cd /home/sharon/dev/chext
./uninstall.sh
```

Then remove the extension from `chrome://extensions/`.

To remove the log file:

```bash
rm /tmp/chext.log
```

## Development

### Testing

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the **Reload** button on the Chext extension
4. Test on a webpage

### Debugging

- **Content Script**: Open DevTools (F12) on any webpage, check Console
- **Background Script**: Go to `chrome://extensions/`, click "service worker" under Chext
- **Native Host**: Check stderr output or add logging to `native-host.py`

## Security Considerations

- The extension has access to all websites (`<all_urls>`) to track elements
- All data is logged locally to `/tmp/chext.log`
- No data is sent to external servers
- The log file may contain sensitive information from websites you visit
- Consider clearing the log file regularly

## License

This project is provided as-is for educational and personal use.

## Project Structure

```
chext/
├── manifest.json              # Extension manifest
├── content.js                 # Content script (runs on web pages)
├── background.js              # Background service worker
├── native-host.py            # Native messaging host
├── com.chext.logger.json     # Native host manifest template
├── install.sh                # Installation script
├── uninstall.sh              # Uninstallation script
├── create-icons.sh           # Icon creation script (optional)
├── icon16.png                # Extension icon (16x16)
├── icon48.png                # Extension icon (48x48)
├── icon128.png               # Extension icon (128x128)
└── README.md                 # This file
```

## Contributing

Feel free to modify and enhance this extension for your needs!
