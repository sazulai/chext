// Native messaging host name (must match the native host configuration)
const NATIVE_HOST_NAME = 'com.chext.logger';

// Port for native messaging
let nativePort = null;

// Extension enabled state
let isEnabled = true;

// Update the extension icon based on enabled state
function updateIcon() {
  const iconSet = isEnabled ? {
    "16": "icon16_enabled.png",
    "48": "icon48_enabled.png",
    "128": "icon128_enabled.png"
  } : {
    "16": "icon16_disabled.png",
    "48": "icon48_disabled.png",
    "128": "icon128_disabled.png"
  };

  chrome.action.setIcon({ path: iconSet });

  const title = isEnabled ?
    "Chext Logger - Enabled (click to disable)" :
    "Chext Logger - Disabled (click to enable)";
  chrome.action.setTitle({ title: title });
}

// Toggle the extension on/off
function toggleExtension() {
  isEnabled = !isEnabled;

  // Save state to storage
  chrome.storage.local.set({ enabled: isEnabled });

  // Update icon
  updateIcon();

  // Notify all content scripts
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_STATE',
        enabled: isEnabled
      }).catch(() => {
        // Ignore errors for tabs that don't have the content script
      });
    });
  });

  console.log(`Chext ${isEnabled ? 'enabled' : 'disabled'}`);
}

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  toggleExtension();
});

// Connect to native messaging host
function connectNative() {
  try {
    nativePort = chrome.runtime.connectNative(NATIVE_HOST_NAME);

    nativePort.onMessage.addListener((message) => {
      console.log('Received from native host:', message);
    });

    nativePort.onDisconnect.addListener(() => {
      console.log('Disconnected from native host');
      const error = chrome.runtime.lastError;
      if (error) {
        console.error('Native host error:', error.message);
      }
      nativePort = null;

      // Try to reconnect after 5 seconds
      setTimeout(connectNative, 5000);
    });

    console.log('Connected to native host');
  } catch (error) {
    console.error('Failed to connect to native host:', error);
    nativePort = null;

    // Try to reconnect after 5 seconds
    setTimeout(connectNative, 5000);
  }
}

// Send log data to native host
function sendToNativeHost(data) {
  if (nativePort) {
    try {
      nativePort.postMessage(data);
    } catch (error) {
      console.error('Failed to send message to native host:', error);
      // Try to reconnect
      connectNative();
    }
  } else {
    console.warn('Native host not connected, attempting to connect...');
    connectNative();
    // Queue the message to be sent after connection
    setTimeout(() => {
      if (nativePort) {
        nativePort.postMessage(data);
      }
    }, 1000);
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOG_ELEMENT') {
    // Only log if enabled
    if (!isEnabled) {
      sendResponse({ status: 'disabled' });
      return true;
    }

    // Format the log entry (just the text)
    const logEntry = {
      timestamp: message.data.timestamp,
      url: message.data.url,
      text: message.data.text
    };

    // Send to native host
    sendToNativeHost(logEntry);

    sendResponse({ status: 'logged' });
  } else if (message.type === 'GET_STATE') {
    // Allow content scripts to query the current state
    sendResponse({ enabled: isEnabled });
  }

  return true; // Keep the message channel open for async response
});

// Initialize native messaging connection when extension starts
connectNative();

// Load saved state and initialize icon
chrome.storage.local.get(['enabled'], (result) => {
  if (result.enabled !== undefined) {
    isEnabled = result.enabled;
  }
  updateIcon();
  console.log(`Chext background service worker initialized (${isEnabled ? 'enabled' : 'disabled'})`);
});
