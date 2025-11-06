/**
 * Background service worker for Multi-Platform Search Extension
 * Handles context menu creation and search initialization
 */

importScripts('urls.js');

/**
 * Initialize context menus when extension is installed or updated
 */
chrome.runtime.onInstalled.addListener(() => {
  try {
    // Create context menu items for each platform
    Object.keys(PLATFORM_CONFIG).forEach((platform) => {
      chrome.contextMenus.create({
        id: platform,
        title: `${PLATFORM_CONFIG[platform].icon} Search on ${platform} "%s"`,
        contexts: ['selection']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error creating context menu for ${platform}:`, chrome.runtime.lastError);
        }
      });
    });

    console.log('Multi-Platform Search Extension: Context menus created successfully');
  } catch (error) {
    console.error('Error in onInstalled listener:', error);
  }
});

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener((info, _tab) => {
  try {
    const platform = info.menuItemId;
    const query = info.selectionText;

    if (!query || query.trim().length === 0) {
      console.warn('No text selected for search');
      return;
    }

    if (!PLATFORM_CONFIG[platform]) {
      console.error(`Invalid platform: ${platform}`);
      return;
    }

    const url = getSearchUrl(platform, query);

    if (url) {
      chrome.tabs.create({ url }, (_newTab) => {
        if (chrome.runtime.lastError) {
          console.error('Error creating tab:', chrome.runtime.lastError);
        } else {
          console.log(`Search opened for ${platform}: ${query}`);

          // Save to history
          chrome.storage.local.get(['searchHistory'], (result) => {
            let history = result.searchHistory || [];

            history.unshift({
              platform,
              query,
              timestamp: Date.now()
            });

            // Keep only last 20 searches
            history = history.slice(0, 20);

            chrome.storage.local.set({ searchHistory: history });
          });
        }
      });
    } else {
      console.error(`Failed to generate URL for platform: ${platform}`);
    }
  } catch (error) {
    console.error('Error in context menu click handler:', error);
  }
});

/**
 * Log extension startup
 */
console.log('Multi-Platform Search Extension: Background service worker initialized');
