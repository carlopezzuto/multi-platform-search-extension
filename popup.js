const defaultPlatforms = [
  { name: "Linkedin", template: "https://www.linkedin.com/search/results/people/?keywords=%s" },
  { name: "Github", template: "https://github.com/search?type=Users&q=%s" },
  { name: "MobyGames", template: "https://www.mobygames.com/search/quick?q=%s" },
  { name: "ArtStation", template: "https://www.artstation.com/search/artists?sort_by=followers&query=%s" },
  { name: "Google", template: "https://www.google.com/search?q=%s" },
  { name: "Behance", template: "https://www.behance.net/search/users?search=%s" },
];

let currentPlatforms = defaultPlatforms;

// Generate the search URL for a platform
function getSearchUrl(platform, query) {
  const cfg = currentPlatforms.find((p) => p.name === platform);
  if (!cfg) return "";
  return cfg.template.replace("%s", encodeURIComponent(query));
}

if (typeof document !== 'undefined') {
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('platforms', (data) => {
        currentPlatforms = data.platforms && data.platforms.length ? data.platforms : defaultPlatforms;
        buildButtons();
    });

    function buildButtons() {
        const container = document.getElementById('searchOptions');
        container.innerHTML = '';
        currentPlatforms.forEach((p) => {
            const btn = document.createElement('button');
            btn.textContent = `Search on ${p.name}`;
            btn.addEventListener('click', () => processSearch(p.name));
            container.appendChild(btn);
        });
    }

    // Main function to process the search
    function processSearch(platform) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: getSelectionText
            }, (results) => {
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
                    alert('No text selected. Please select some text to search.');
                }
            });
        });
    }

    // Function to retrieve the selected text
    function getSelectionText() {
        return window.getSelection().toString();
    }


    // Function to handle the search form submission
    document.getElementById('searchForm').addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

        const platform = document.getElementById('platformInput').value;
        let query = document.getElementById('queryInput').value;

        // Check if the user wants to enclose the text in quotes
        const useQuotes = document.getElementById('quoteToggle').checked;
        if (useQuotes) {
            query = `"${query}"`;
        }

        // Perform the search based on the platform
        const url = getSearchUrl(platform, query);

        // Open the search result in a new tab
        chrome.tabs.create({ url });
    });

    // Show platform-specific search tips
function showSearchTips(platform) {
  let tips = '';
  switch (platform) {
    case 'Linkedin':
      tips = `<strong>LinkedIn Operators:</strong><br>
      - <strong>AND:</strong> Include both terms (e.g., Developer AND Manager)<br>
      - <strong>OR:</strong> Include either term (e.g., Developer OR Designer)<br>
      - <strong>NOT:</strong> Exclude a term (e.g., Developer NOT Designer)`;
      break;

    case 'Github':
      tips = `<strong>GitHub Operators:</strong><br>
      - <strong>user:</strong>username &rarr; Search for specific users (e.g., user:octocat)<br>
      - <strong>repo:</strong>owner/repo &rarr; Search within a repository (e.g., repo:github/linguist)<br>
      - <strong>language:</strong>language &rarr; Filter by programming language (e.g., language:python)<br>
      - <strong>in:login:</strong> Search usernames (e.g., kenya in:login)<br>
      - <strong>location:</strong>LOCATION &rarr; Find users by location (e.g., location:Iceland)`;
      break;

    case 'MobyGames':
      tips = `<strong>MobyGames Operators:</strong><br>
      - <strong>Quotes:</strong> Use quotes for exact matches (e.g., "Super Mario Bros")<br>
      - <strong>Keywords:</strong> Combine keywords for broader searches (e.g., Mario platformer)`;
      break;

    case 'ArtStation':
      tips = `<strong>ArtStation Operators:</strong><br>
      - <strong>artist:</strong>name &rarr; Search by artist name (e.g., artist:JohnDoe)<br>
      - <strong>media:</strong>type &rarr; Filter by media type (e.g., media:3D)`;
      break;

    case 'Google':
      tips = `<strong>Google Operators:</strong><br>
      - <strong>AND:</strong> Include both terms (e.g., Developer AND Designer)<br>
      - <strong>OR:</strong> Include either term (e.g., Apple OR Orange)<br>
      - <strong>NOT:</strong> Exclude a term (e.g., Apple NOT Fruit)<br>
      - <strong>-:</strong> Exclude specific words (e.g., Apple -fruit)<br>
      - <strong>" ":</strong> Use quotes for exact phrase (e.g., "best coding practices")<br>
      - <strong>AROUND(X):</strong> Search for two terms within X words of each other (e.g., Apple AROUND(3) Pie)`;
      break;

    case 'Behance':
      tips = `<strong>Behance Operators:</strong><br>
      - <strong>artist:</strong>name &rarr; Search specific artists (e.g., artist:JohnDoe)<br>
      - <strong>project:</strong>keyword &rarr; Find projects by keyword (e.g., project:branding)`;
      break;
  }

  // Display search tips in the UI
  document.getElementById('searchTips').innerHTML = tips;
}
});
}

// Export for testing environments
if (typeof module !== "undefined") {
  module.exports = { getSearchUrl, defaultPlatforms };
}
