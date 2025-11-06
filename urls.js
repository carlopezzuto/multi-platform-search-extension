(function (global) {
  // Platform configuration with URLs, tips, and metadata
  const PLATFORM_CONFIG = {
    Linkedin: {
      url: 'https://www.linkedin.com/search/results/people/?keywords=',
      tips: `<strong>LinkedIn Operators:</strong><br>
      - <strong>AND:</strong> Include both terms (e.g., Developer AND Manager)<br>
      - <strong>OR:</strong> Include either term (e.g., Developer OR Designer)<br>
      - <strong>NOT:</strong> Exclude a term (e.g., Developer NOT Designer)`,
      icon: '💼'
    },
    Github: {
      url: 'https://github.com/search?type=Users&q=',
      tips: `<strong>GitHub Operators:</strong><br>
      - <strong>user:</strong>username &rarr; Search for specific users (e.g., user:octocat)<br>
      - <strong>repo:</strong>owner/repo &rarr; Search within a repository (e.g., repo:github/linguist)<br>
      - <strong>language:</strong>language &rarr; Filter by programming language (e.g., language:python)<br>
      - <strong>in:login:</strong> Search usernames (e.g., kenya in:login)<br>
      - <strong>location:</strong>LOCATION &rarr; Find users by location (e.g., location:Iceland)`,
      icon: '🐙'
    },
    MobyGames: {
      url: 'https://www.mobygames.com/search/quick?q=',
      tips: `<strong>MobyGames Operators:</strong><br>
      - <strong>Quotes:</strong> Use quotes for exact matches (e.g., "Super Mario Bros")<br>
      - <strong>Keywords:</strong> Combine keywords for broader searches (e.g., Mario platformer)`,
      icon: '🎮'
    },
    ArtStation: {
      url: 'https://www.artstation.com/search/artists?sort_by=followers&query=',
      tips: `<strong>ArtStation Operators:</strong><br>
      - <strong>artist:</strong>name &rarr; Search by artist name (e.g., artist:JohnDoe)<br>
      - <strong>media:</strong>type &rarr; Filter by media type (e.g., media:3D)`,
      icon: '🎨'
    },
    Google: {
      url: 'https://www.google.com/search?q=',
      tips: `<strong>Google Operators:</strong><br>
      - <strong>AND:</strong> Include both terms (e.g., Developer AND Designer)<br>
      - <strong>OR:</strong> Include either term (e.g., Apple OR Orange)<br>
      - <strong>NOT:</strong> Exclude a term (e.g., Apple NOT Fruit)<br>
      - <strong>-:</strong> Exclude specific words (e.g., Apple -fruit)<br>
      - <strong>" ":</strong> Use quotes for exact phrase (e.g., "best coding practices")<br>
      - <strong>AROUND(X):</strong> Search for two terms within X words of each other (e.g., Apple AROUND(3) Pie)`,
      icon: '🔍'
    },
    Behance: {
      url: 'https://www.behance.net/search/users?search=',
      tips: `<strong>Behance Operators:</strong><br>
      - <strong>artist:</strong>name &rarr; Search specific artists (e.g., artist:JohnDoe)<br>
      - <strong>project:</strong>keyword &rarr; Find projects by keyword (e.g., project:branding)`,
      icon: '🎭'
    },
    StackOverflow: {
      url: 'https://stackoverflow.com/search?q=',
      tips: `<strong>Stack Overflow Operators:</strong><br>
      - <strong>[tag]:</strong> Search within tags (e.g., [javascript] async)<br>
      - <strong>user:</strong>id &rarr; Search by user (e.g., user:12345)<br>
      - <strong>is:question:</strong> Only show questions<br>
      - <strong>is:answer:</strong> Only show answers<br>
      - <strong>score:</strong>n &rarr; Minimum score (e.g., score:5)`,
      icon: '📚'
    },
    Twitter: {
      url: 'https://twitter.com/search?q=',
      tips: `<strong>Twitter/X Operators:</strong><br>
      - <strong>from:</strong>username &rarr; Tweets from user (e.g., from:elonmusk)<br>
      - <strong>to:</strong>username &rarr; Tweets to user<br>
      - <strong>#hashtag:</strong> Search hashtags<br>
      - <strong>filter:verified:</strong> Only verified accounts<br>
      - <strong>lang:</strong>en &rarr; Filter by language`,
      icon: '🐦'
    },
    Reddit: {
      url: 'https://www.reddit.com/search/?q=',
      tips: `<strong>Reddit Operators:</strong><br>
      - <strong>subreddit:</strong>name &rarr; Search within subreddit (e.g., subreddit:programming)<br>
      - <strong>author:</strong>username &rarr; Posts by user<br>
      - <strong>title:</strong>text &rarr; Search in titles only<br>
      - <strong>selftext:</strong>text &rarr; Search in post text<br>
      - <strong>site:</strong>url &rarr; Posts linking to domain`,
      icon: '👽'
    },
    YouTube: {
      url: 'https://www.youtube.com/results?search_query=',
      tips: `<strong>YouTube Operators:</strong><br>
      - <strong>channel:</strong>name &rarr; Search within channel<br>
      - <strong>" ":</strong> Exact phrase match<br>
      - <strong>-word:</strong> Exclude word<br>
      - <strong>intitle:</strong>text &rarr; Search in titles<br>
      - Combine with filters: duration, upload date, quality`,
      icon: '📺'
    },
    Medium: {
      url: 'https://medium.com/search?q=',
      tips: `<strong>Medium Operators:</strong><br>
      - Use simple keywords for best results<br>
      - Filter by: Stories, Publications, People, Tags<br>
      - Use quotes for exact phrases<br>
      - Add tags to refine search`,
      icon: '📝'
    },
    DeviantArt: {
      url: 'https://www.deviantart.com/search?q=',
      tips: `<strong>DeviantArt Operators:</strong><br>
      - <strong>by:</strong>username &rarr; Search by artist<br>
      - <strong>in:</strong>category &rarr; Search within category<br>
      - Use quotes for exact matches<br>
      - Filter by: Deviations, Shops, People, Groups`,
      icon: '🖼️'
    },
    Dribbble: {
      url: 'https://dribbble.com/search/',
      tips: `<strong>Dribbble Operators:</strong><br>
      - Search for: Shots, Designers, Teams<br>
      - Filter by: Animated, Popular, Recent<br>
      - Use color filters for specific palettes<br>
      - Use quotes for exact phrase matching`,
      icon: '🏀'
    }
  };

  // Legacy PLATFORM_URLS for backward compatibility
  const PLATFORM_URLS = {};
  Object.keys(PLATFORM_CONFIG).forEach((platform) => {
    PLATFORM_URLS[platform] = PLATFORM_CONFIG[platform].url;
  });

  /**
   * Generate a search URL for a given platform and query
   * @param {string} platform - The platform name
   * @param {string} query - The search query
   * @returns {string} The complete search URL
   */
  function getSearchUrl(platform, query) {
    const q = encodeURIComponent(query);
    return PLATFORM_URLS[platform] ? `${PLATFORM_URLS[platform]}${q}` : '';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLATFORM_URLS, getSearchUrl, PLATFORM_CONFIG };
  } else {
    global.PLATFORM_URLS = PLATFORM_URLS;
    global.getSearchUrl = getSearchUrl;
    global.PLATFORM_CONFIG = PLATFORM_CONFIG;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
