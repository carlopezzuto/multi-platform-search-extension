const { getSearchUrl } = require('./popup');

describe('getSearchUrl', () => {
  test('generates Google search URL', () => {
    const url = getSearchUrl('Google', 'hello world');
    expect(url).toBe('https://www.google.com/search?q=hello%20world');
  });
});
