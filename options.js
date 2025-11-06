/**
 * Options page for Multi-Platform Search Extension
 * Handles user preferences and platform customization
 */

// Default settings
const DEFAULT_SETTINGS = {
  enabledPlatforms: Object.keys(PLATFORM_CONFIG),
  platformOrder: Object.keys(PLATFORM_CONFIG),
  closeAfterSearch: true,
  showKeyboardShortcuts: true,
  saveSearchHistory: true,
  maxHistoryEntries: 20,
  showPlatformIcons: true,
  buttonLayout: 'grid',
  enableBatchSearch: false,
  batchSearchBehavior: 'tabs'
};

let currentSettings = { ...DEFAULT_SETTINGS };
let draggedElement = null;

/**
 * Initialize the options page
 */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

/**
 * Load settings from storage
 */
function loadSettings() {
  chrome.storage.sync.get(['userSettings'], (result) => {
    if (result.userSettings) {
      currentSettings = { ...DEFAULT_SETTINGS, ...result.userSettings };
    }

    renderPlatforms();
    applySettingsToUI();
  });
}

/**
 * Render platform list with drag-and-drop
 */
function renderPlatforms() {
  const platformList = document.getElementById('platformList');
  platformList.innerHTML = '';

  currentSettings.platformOrder.forEach((platform) => {
    const isEnabled = currentSettings.enabledPlatforms.includes(platform);
    const config = PLATFORM_CONFIG[platform];

    if (!config) {
      return;
    }

    const platformItem = document.createElement('div');
    platformItem.className = `platform-item ${isEnabled ? '' : 'disabled'}`;
    platformItem.draggable = true;
    platformItem.dataset.platform = platform;

    platformItem.innerHTML = `
      <div class="platform-info">
        <div class="drag-handle" title="Drag to reorder">☰</div>
        <div class="platform-icon">${config.icon}</div>
        <div class="platform-name">${platform}</div>
      </div>
      <div class="platform-controls">
        <div class="platform-toggle">
          <input type="checkbox" id="toggle-${platform}" ${isEnabled ? 'checked' : ''} />
          <label for="toggle-${platform}">Enabled</label>
        </div>
      </div>
    `;

    // Add drag event listeners
    platformItem.addEventListener('dragstart', handleDragStart);
    platformItem.addEventListener('dragend', handleDragEnd);
    platformItem.addEventListener('dragover', handleDragOver);
    platformItem.addEventListener('drop', handleDrop);

    // Add toggle event listener
    const toggleCheckbox = platformItem.querySelector(`#toggle-${platform}`);
    toggleCheckbox.addEventListener('change', (e) => {
      togglePlatform(platform, e.target.checked);
    });

    platformList.appendChild(platformItem);
  });
}

/**
 * Apply settings to UI elements
 */
function applySettingsToUI() {
  document.getElementById('closeAfterSearch').checked = currentSettings.closeAfterSearch;
  document.getElementById('showKeyboardShortcuts').checked = currentSettings.showKeyboardShortcuts;
  document.getElementById('saveSearchHistory').checked = currentSettings.saveSearchHistory;
  document.getElementById('maxHistoryEntries').value = currentSettings.maxHistoryEntries;
  document.getElementById('showPlatformIcons').checked = currentSettings.showPlatformIcons;
  document.getElementById('buttonLayout').value = currentSettings.buttonLayout;
  document.getElementById('enableBatchSearch').checked = currentSettings.enableBatchSearch;
  document.getElementById('batchSearchBehavior').value = currentSettings.batchSearchBehavior;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('resetSettings').addEventListener('click', resetSettings);
  document.getElementById('exportSettings').addEventListener('click', exportSettings);
  document.getElementById('importSettings').addEventListener('click', importSettings);
}

/**
 * Toggle platform enabled/disabled
 */
function togglePlatform(platform, enabled) {
  if (enabled) {
    if (!currentSettings.enabledPlatforms.includes(platform)) {
      currentSettings.enabledPlatforms.push(platform);
    }
  } else {
    currentSettings.enabledPlatforms = currentSettings.enabledPlatforms.filter(p => p !== platform);
  }

  // Update UI
  const platformItem = document.querySelector(`[data-platform="${platform}"]`);
  if (enabled) {
    platformItem.classList.remove('disabled');
  } else {
    platformItem.classList.add('disabled');
  }
}

/**
 * Drag and drop handlers
 */
function handleDragStart(e) {
  draggedElement = e.currentTarget;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');

  // Remove all drag-over classes
  document.querySelectorAll('.platform-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }

  e.dataTransfer.dropEffect = 'move';

  const item = e.currentTarget;
  if (item !== draggedElement) {
    item.classList.add('drag-over');
  }

  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const dropTarget = e.currentTarget;

  if (draggedElement !== dropTarget) {
    const draggedPlatform = draggedElement.dataset.platform;
    const targetPlatform = dropTarget.dataset.platform;

    const draggedIndex = currentSettings.platformOrder.indexOf(draggedPlatform);
    const targetIndex = currentSettings.platformOrder.indexOf(targetPlatform);

    // Reorder array
    currentSettings.platformOrder.splice(draggedIndex, 1);
    currentSettings.platformOrder.splice(targetIndex, 0, draggedPlatform);

    // Re-render
    renderPlatforms();
  }

  dropTarget.classList.remove('drag-over');

  return false;
}

/**
 * Save settings to storage
 */
function saveSettings() {
  // Collect all settings from UI
  currentSettings.closeAfterSearch = document.getElementById('closeAfterSearch').checked;
  currentSettings.showKeyboardShortcuts = document.getElementById('showKeyboardShortcuts').checked;
  currentSettings.saveSearchHistory = document.getElementById('saveSearchHistory').checked;
  currentSettings.maxHistoryEntries = parseInt(document.getElementById('maxHistoryEntries').value);
  currentSettings.showPlatformIcons = document.getElementById('showPlatformIcons').checked;
  currentSettings.buttonLayout = document.getElementById('buttonLayout').value;
  currentSettings.enableBatchSearch = document.getElementById('enableBatchSearch').checked;
  currentSettings.batchSearchBehavior = document.getElementById('batchSearchBehavior').value;

  // Save to storage
  chrome.storage.sync.set({ userSettings: currentSettings }, () => {
    showNotification('Settings saved successfully!', 'success');
  });
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    currentSettings = { ...DEFAULT_SETTINGS };
    chrome.storage.sync.set({ userSettings: currentSettings }, () => {
      renderPlatforms();
      applySettingsToUI();
      showNotification('Settings reset to defaults', 'info');
    });
  }
}

/**
 * Export settings to JSON file
 */
function exportSettings() {
  const dataStr = JSON.stringify(currentSettings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'multi-platform-search-settings.json';
  link.click();

  URL.revokeObjectURL(url);
  showNotification('Settings exported successfully!', 'success');
}

/**
 * Import settings from JSON file
 */
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedSettings = JSON.parse(event.target.result);
        currentSettings = { ...DEFAULT_SETTINGS, ...importedSettings };

        chrome.storage.sync.set({ userSettings: currentSettings }, () => {
          renderPlatforms();
          applySettingsToUI();
          showNotification('Settings imported successfully!', 'success');
        });
      } catch (error) {
        showNotification('Error importing settings: Invalid file format', 'error');
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}
