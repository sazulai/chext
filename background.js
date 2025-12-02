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

  // Notify side panel
  chrome.runtime.sendMessage({
    type: 'STATE_CHANGED',
    enabled: isEnabled
  }).catch(() => {
    // Side panel might not be open
  });

  console.log(`Chext ${isEnabled ? 'enabled' : 'disabled'}`);
}

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  toggleExtension();
});

// Send captured data to side panel
function sendToSidePanel(data) {
  // Send message to side panel
  chrome.runtime.sendMessage({
    type: 'NEW_CAPTURE',
    data: data
  }).catch(() => {
    // Side panel might not be open, data is already in storage
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOG_ELEMENT') {
    // Only log if enabled
    if (!isEnabled) {
      sendResponse({ status: 'disabled' });
      return true;
    }

    // Format the captured entry
    const capturedItem = {
      timestamp: message.data.timestamp,
      url: message.data.url,
      text: message.data.text
    };

    // Save to storage
    chrome.storage.local.get(['capturedItems'], (result) => {
      const items = result.capturedItems || [];
      items.push(capturedItem);
      chrome.storage.local.set({ capturedItems: items }, () => {
        // Send to side panel
        sendToSidePanel(capturedItem);
        sendResponse({ status: 'captured' });
      });
    });

    return true; // Keep the message channel open for async response
  } else if (message.type === 'GET_STATE') {
    // Allow content scripts and side panel to query the current state
    sendResponse({ enabled: isEnabled });
  }

  return true; // Keep the message channel open for async response
});

// Load saved state and initialize icon
chrome.storage.local.get(['enabled'], (result) => {
  if (result.enabled !== undefined) {
    isEnabled = result.enabled;
  }
  updateIcon();
  console.log(`Chext background service worker initialized (${isEnabled ? 'enabled' : 'disabled'})`);
});
