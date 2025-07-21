importScripts('urls.js');

chrome.runtime.onInstalled.addListener(() => {
  Object.keys(PLATFORM_URLS).forEach((platform) => {
    chrome.contextMenus.create({
      id: platform,
      title: `Search on ${platform} "%s"`,
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
