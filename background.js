importScripts('urls.js');

const platforms = [
  { id: 'Linkedin', title: 'Search on LinkedIn' },
  { id: 'Github', title: 'Search on Github' },
  { id: 'MobyGames', title: 'Search on MobyGames' },
  { id: 'ArtStation', title: 'Search on ArtStation' },
  { id: 'Google', title: 'Search on Google' },
  { id: 'Behance', title: 'Search on Behance' }
];

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
