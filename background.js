const platforms = [
  { id: 'Linkedin', title: 'Search on LinkedIn' },
  { id: 'Github', title: 'Search on Github' },
  { id: 'MobyGames', title: 'Search on MobyGames' },
  { id: 'ArtStation', title: 'Search on ArtStation' },
  { id: 'Google', title: 'Search on Google' },
  { id: 'Behance', title: 'Search on Behance' }
];

function getSearchUrl(platform, query) {
  const q = encodeURIComponent(query);
  switch (platform) {
    case 'Linkedin':
      return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
    case 'Github':
      return `https://github.com/search?type=Users&q=${q}`;
    case 'MobyGames':
      return `https://www.mobygames.com/search/quick?q=${q}`;
    case 'ArtStation':
      return `https://www.artstation.com/search/artists?sort_by=followers&query=${q}`;
    case 'Google':
      return `https://www.google.com/search?q=${q}`;
    case 'Behance':
      return `https://www.behance.net/search/users?search=${q}`;
    default:
      return '';
  }
}

chrome.runtime.onInstalled.addListener(() => {
  platforms.forEach((platform) => {
    chrome.contextMenus.create({
      id: platform.id,
      title: `${platform.title} "%s"`,
      contexts: ['selection']
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const platform = info.menuItemId;
  const query = info.selectionText;
  const url = getSearchUrl(platform, query);
  if (url) {
    chrome.tabs.create({ url });
  }
});
