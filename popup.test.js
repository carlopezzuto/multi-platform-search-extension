const { getSearchUrl } = require('./popup');

describe('getSearchUrl', () => {
  const cases = [
    ['Google', 'https://www.google.com/search?q=hello%20world'],
    ['Linkedin', 'https://www.linkedin.com/search/results/people/?keywords=hello%20world'],
    ['Github', 'https://github.com/search?type=Users&q=hello%20world'],
    ['MobyGames', 'https://www.mobygames.com/search/quick?q=hello%20world'],
    ['ArtStation', 'https://www.artstation.com/search/artists?sort_by=followers&query=hello%20world'],
    ['Behance', 'https://www.behance.net/search/users?search=hello%20world'],
  ];

  test.each(cases)('generates %s search URL', (platform, expected) => {
    const url = getSearchUrl(platform, 'hello world');
    expect(url).toBe(expected);
  });
});
