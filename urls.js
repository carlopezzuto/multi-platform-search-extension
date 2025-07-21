(function(global){
const PLATFORM_URLS = {
  Linkedin: 'https://www.linkedin.com/search/results/people/?keywords=',
  Github: 'https://github.com/search?type=Users&q=',
  MobyGames: 'https://www.mobygames.com/search/quick?q=',
  ArtStation: 'https://www.artstation.com/search/artists?sort_by=followers&query=',
  Google: 'https://www.google.com/search?q=',
  Behance: 'https://www.behance.net/search/users?search=',
};

function getSearchUrl(platform, query){
  const q = encodeURIComponent(query);
  return PLATFORM_URLS[platform] ? `${PLATFORM_URLS[platform]}${q}` : '';
}

if (typeof module !== 'undefined' && module.exports){
  module.exports = { PLATFORM_URLS, getSearchUrl };
} else {
  global.PLATFORM_URLS = PLATFORM_URLS;
  global.getSearchUrl = getSearchUrl;
}
})(typeof globalThis !== 'undefined' ? globalThis : this);
