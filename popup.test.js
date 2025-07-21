const { getSearchUrl, PLATFORM_URLS } = require('./urls');

describe('getSearchUrl', () => {
  const query = 'hello world';
  for (const [platform, baseUrl] of Object.entries(PLATFORM_URLS)) {
    test(`generates ${platform} search URL`, () => {
      const url = getSearchUrl(platform, query);
      expect(url).toBe(`${baseUrl}${encodeURIComponent(query)}`);
    });
  }
});
