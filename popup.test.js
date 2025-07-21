const { getSearchUrl, PLATFORM_URLS } = require('./popup');

describe('getSearchUrl', () => {
  const query = 'hello world';
  for (const [platform, baseUrl] of Object.entries(PLATFORM_URLS)) {
    test(`generates ${platform} search URL`, () => {
      const url = getSearchUrl(platform, query);
      expect(url).toBe(`${baseUrl}${encodeURIComponent(query)}`);
    });
  }
});
