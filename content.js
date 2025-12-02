// Track if extension is enabled
let isEnabled = true;

// Track if extension context is valid
let contextValid = true;

// Function to extract text from an element
function getElementInfo(element) {
  if (!element) return null;

  // Get text content, trimmed and limited to 500 characters
  const text = element.textContent?.trim().substring(0, 500) || '';

  // Only return if there's actual text
  if (!text) return null;

  return {
    timestamp: new Date().toISOString(),
    text: text,
    url: window.location.href
  };
}

// Send element info to background script
function logElement(element) {
  // Don't log if disabled or context is invalid
  if (!isEnabled || !contextValid) {
    return;
  }

  const info = getElementInfo(element);
  if (info) {
    try {
      chrome.runtime.sendMessage({
        type: 'LOG_ELEMENT',
        data: info
      }, (response) => {
        // Check for runtime errors
        if (chrome.runtime.lastError) {
          // Extension context invalidated
          contextValid = false;
          console.log('Chext: Extension context invalidated, stopping logging');
        }
      });
    } catch (error) {
      // Extension context invalidated
      contextValid = false;
      console.log('Chext: Extension context invalidated, stopping logging');
    }
  }
}

// Click event handler
function handleClick(event) {
  // Only handle left mouse button (button 0)
  if (event.button === 0) {
    logElement(event.target);
  }
}

// Initialize the tracker
function init() {
  console.log('Chext: Click logger initialized');

  // Log only on left mouse button clicks
  document.addEventListener('click', handleClick, true);
}

// Start tracking when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'active' });
  } else if (message.type === 'TOGGLE_STATE') {
    isEnabled = message.enabled;
    console.log(`Chext content script: ${isEnabled ? 'enabled' : 'disabled'}`);
    sendResponse({ status: 'updated' });
  }
});

// Query initial state from background script
try {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (chrome.runtime.lastError) {
      // Extension context invalidated
      contextValid = false;
      return;
    }
    if (response && response.enabled !== undefined) {
      isEnabled = response.enabled;
      console.log(`Chext content script initialized: ${isEnabled ? 'enabled' : 'disabled'}`);
    }
  });
} catch (error) {
  // Extension context invalidated
  contextValid = false;
}
