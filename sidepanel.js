// DOM elements
const contentList = document.getElementById('contentList');
const emptyState = document.getElementById('emptyState');
const itemCount = document.getElementById('itemCount');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const statusIndicator = document.getElementById('statusIndicator');

// Storage for captured items
let capturedItems = [];
let isEnabled = true;

// Load saved items from storage
function loadItems() {
  chrome.storage.local.get(['capturedItems', 'enabled'], (result) => {
    if (result.capturedItems) {
      capturedItems = result.capturedItems;
      renderItems();
    }
    if (result.enabled !== undefined) {
      isEnabled = result.enabled;
      updateStatus();
    }
  });
}

// Save items to storage
function saveItems() {
  chrome.storage.local.set({ capturedItems: capturedItems });
}

// Update status indicator
function updateStatus() {
  if (isEnabled) {
    statusIndicator.classList.remove('status-disabled');
  } else {
    statusIndicator.classList.add('status-disabled');
  }
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Extract domain from URL
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// Render all items
function renderItems() {
  if (capturedItems.length === 0) {
    emptyState.style.display = 'flex';
    itemCount.textContent = '0 items captured';
    return;
  }

  emptyState.style.display = 'none';
  contentList.innerHTML = '';

  // Render items in reverse order (newest first)
  for (let i = capturedItems.length - 1; i >= 0; i--) {
    const item = capturedItems[i];
    const itemEl = createItemElement(item, i);
    contentList.appendChild(itemEl);
  }

  itemCount.textContent = `${capturedItems.length} item${capturedItems.length !== 1 ? 's' : ''} captured`;
}

// Create item element
function createItemElement(item, index) {
  const div = document.createElement('div');
  div.className = 'content-item';
  div.innerHTML = `
    <div class="content-text">${escapeHtml(item.text)}</div>
    <div class="content-meta">
      <span class="content-time">${formatTime(item.timestamp)}</span>
      <span class="content-url" title="${escapeHtml(item.url)}">${escapeHtml(getDomain(item.url))}</span>
    </div>
  `;
  return div;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add new item
function addItem(item) {
  capturedItems.push(item);
  saveItems();
  renderItems();
}

// Clear all items
function clearAll() {
  if (capturedItems.length === 0) return;

  if (confirm('Clear all captured content?')) {
    capturedItems = [];
    saveItems();
    renderItems();
  }
}

// Export items to text file
function exportItems() {
  if (capturedItems.length === 0) {
    alert('No items to export');
    return;
  }

  let text = 'Chext - Captured Content\n';
  text += '='.repeat(50) + '\n\n';

  capturedItems.forEach((item, index) => {
    text += `[${index + 1}] ${new Date(item.timestamp).toLocaleString()}\n`;
    text += `URL: ${item.url}\n`;
    text += `Text: ${item.text}\n`;
    text += '-'.repeat(50) + '\n\n';
  });

  // Create blob and download
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chext-export-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Listen for new captured items from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NEW_CAPTURE') {
    addItem(message.data);
    sendResponse({ status: 'added' });
  } else if (message.type === 'STATE_CHANGED') {
    isEnabled = message.enabled;
    updateStatus();
    sendResponse({ status: 'updated' });
  }
});

// Event listeners
clearBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportItems);

// Initialize
loadItems();

// Query current state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (response && response.enabled !== undefined) {
    isEnabled = response.enabled;
    updateStatus();
  }
});
