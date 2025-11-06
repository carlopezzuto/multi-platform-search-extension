// Access shared search utilities
let PLATFORM_URLS;
let getSearchUrl;
let PLATFORM_CONFIG;

if (typeof module !== 'undefined' && module.exports) {
  const urlsModule = require('./urls');
  PLATFORM_URLS = urlsModule.PLATFORM_URLS;
  getSearchUrl = urlsModule.getSearchUrl;
  PLATFORM_CONFIG = urlsModule.PLATFORM_CONFIG;
} else {
  ({ PLATFORM_URLS, getSearchUrl, PLATFORM_CONFIG } = globalThis);
}

if (typeof document !== 'undefined') {
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the extension
    initializeButtons();
    initializeFormHandlers();
    loadSearchHistory();
    setupKeyboardShortcuts();

    /**
     * Initialize platform buttons dynamically from PLATFORM_CONFIG
     */
    function initializeButtons() {
        Object.keys(PLATFORM_CONFIG).forEach(platform => {
            const button = document.getElementById(`search${platform}`);
            if (button) {
                button.addEventListener('click', () => processSearch(platform));
            }
        });
    }

    /**
     * Initialize form submission and input handlers
     */
    function initializeFormHandlers() {
        // Form submission handler
        document.getElementById('searchForm').addEventListener('submit', handleFormSubmit);

        // Query input handler for real-time validation
        const queryInput = document.getElementById('queryInput');
        queryInput.addEventListener('input', validateQueryInput);
        queryInput.addEventListener('focus', showHistoryDropdown);

        // Close history dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const historyDropdown = document.getElementById('historyDropdown');
            if (historyDropdown && !queryInput.contains(e.target) && !historyDropdown.contains(e.target)) {
                hideHistoryDropdown();
            }
        });
    }

    /**
     * Main function to process the search for a given platform
     * @param {string} platform - The platform to search on
     */
    function processSearch(platform) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                console.error('Error querying tabs:', chrome.runtime.lastError);
                showNotification('Error accessing current tab', 'error');
                return;
            }

            if (!tabs || tabs.length === 0) {
                showNotification('No active tab found', 'error');
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getSelectionText
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error('Error executing script:', chrome.runtime.lastError);
                    showNotification('Could not access page content', 'error');
                    return;
                }

                if (results && results.length > 0 && results[0].result) {
                    // Set the selected text in the form input
                    const queryField = document.getElementById('queryInput');
                    queryField.value = results[0].result;
                    queryField.focus();

                    // Save the selected platform
                    document.getElementById('platformInput').value = platform;

                    // Show platform-specific search tips
                    showSearchTips(platform);
                } else {
                    showNotification('No text selected. Please select some text to search.', 'warning');
                }
            });
        });
    }

    /**
     * Function to retrieve the selected text from the page
     * @returns {string} The selected text
     */
    function getSelectionText() {
        return window.getSelection().toString();
    }

    /**
     * Handle form submission
     * @param {Event} event - The form submission event
     */
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent form submission

        const platform = document.getElementById('platformInput').value;
        let query = document.getElementById('queryInput').value;

        // Validate input
        if (!query || query.trim().length === 0) {
            showNotification('Please enter a search query', 'warning');
            return;
        }

        if (!platform) {
            showNotification('Please select a platform first', 'warning');
            return;
        }

        // Check if the user wants to enclose the text in quotes
        const useQuotes = document.getElementById('quoteToggle').checked;
        if (useQuotes) {
            query = `"${query}"`;
        }

        // Perform the search based on the platform
        const url = getSearchUrl(platform, query);

        if (!url) {
            showNotification('Invalid platform or URL', 'error');
            return;
        }

        // Save to history
        saveToHistory(platform, query);

        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        // Open the search result in a new tab
        chrome.tabs.create({ url }, (tab) => {
            if (chrome.runtime.lastError) {
                console.error('Error creating tab:', chrome.runtime.lastError);
                showNotification('Failed to open search', 'error');
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            } else {
                // Close popup after successful search
                setTimeout(() => window.close(), 300);
            }
        });
    }

    /**
     * Validate query input in real-time
     */
    function validateQueryInput() {
        const queryInput = document.getElementById('queryInput');
        const query = queryInput.value;

        if (query && query.trim().length > 0) {
            queryInput.style.borderColor = '#00ffff';
        } else {
            queryInput.style.borderColor = '#ff5555';
        }
    }

    /**
     * Show platform-specific search tips
     * @param {string} platform - The platform name
     */
    function showSearchTips(platform) {
        const config = PLATFORM_CONFIG[platform];
        const tips = config ? config.tips : '';

        // Display search tips in the UI
        document.getElementById('searchTips').innerHTML = tips;
    }

    /**
     * Show a toast notification to the user
     * @param {string} message - The message to display
     * @param {string} type - The notification type (info, warning, error, success)
     */
    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Save search to history
     * @param {string} platform - The platform name
     * @param {string} query - The search query
     */
    function saveToHistory(platform, query) {
        chrome.storage.local.get(['searchHistory'], (result) => {
            let history = result.searchHistory || [];

            // Add new search to beginning
            history.unshift({
                platform,
                query: query.replace(/^"|"$/g, ''), // Remove surrounding quotes for display
                timestamp: Date.now()
            });

            // Keep only last 20 searches
            history = history.slice(0, 20);

            chrome.storage.local.set({ searchHistory: history });
        });
    }

    /**
     * Load and display search history
     */
    function loadSearchHistory() {
        chrome.storage.local.get(['searchHistory'], (result) => {
            const history = result.searchHistory || [];

            if (history.length > 0) {
                const queryInput = document.getElementById('queryInput');

                // Add history button
                const historyContainer = document.createElement('div');
                historyContainer.id = 'historyContainer';

                const historyDropdown = document.createElement('div');
                historyDropdown.id = 'historyDropdown';

                history.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `<span class="history-item-platform">${item.platform}:</span> ${item.query}`;
                    historyItem.addEventListener('click', () => {
                        queryInput.value = item.query;
                        document.getElementById('platformInput').value = item.platform;
                        showSearchTips(item.platform);
                        hideHistoryDropdown();
                    });
                    historyDropdown.appendChild(historyItem);
                });

                // Add clear history button
                const clearButton = document.createElement('div');
                clearButton.className = 'clear-history';
                clearButton.textContent = 'Clear History';
                clearButton.addEventListener('click', clearSearchHistory);
                historyDropdown.appendChild(clearButton);

                queryInput.parentNode.appendChild(historyContainer);
                historyContainer.appendChild(historyDropdown);
            }
        });
    }

    /**
     * Show history dropdown
     */
    function showHistoryDropdown() {
        const historyDropdown = document.getElementById('historyDropdown');
        if (historyDropdown) {
            historyDropdown.classList.add('show');
        }
    }

    /**
     * Hide history dropdown
     */
    function hideHistoryDropdown() {
        const historyDropdown = document.getElementById('historyDropdown');
        if (historyDropdown) {
            historyDropdown.classList.remove('show');
        }
    }

    /**
     * Clear search history
     */
    function clearSearchHistory() {
        chrome.storage.local.set({ searchHistory: [] }, () => {
            const historyDropdown = document.getElementById('historyDropdown');
            if (historyDropdown) {
                historyDropdown.remove();
            }
            showNotification('Search history cleared', 'success');
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Number keys 1-6 for platform selection
            const platforms = Object.keys(PLATFORM_CONFIG);
            const keyNum = parseInt(e.key);

            if (keyNum >= 1 && keyNum <= platforms.length) {
                const platform = platforms[keyNum - 1];
                processSearch(platform);
                e.preventDefault();
            }

            // Escape to close popup
            if (e.key === 'Escape') {
                window.close();
            }
        });
    }
});
}

// Export for testing environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = require('./urls');
}
