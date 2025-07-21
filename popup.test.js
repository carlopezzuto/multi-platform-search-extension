const { getSearchUrl } = require('./popup');

describe('getSearchUrl', () => {
  test('generates Google search URL', () => {
    const url = getSearchUrl('Google', 'hello world');
    expect(url).toBe('https://www.google.com/search?q=hello%20world');
  });

  test('generates Linkedin search URL', () => {
    const url = getSearchUrl('Linkedin', 'hello world');
    expect(url).toBe(
      'https://www.linkedin.com/search/results/people/?keywords=hello%20world'
    );
  });

  test('generates Github search URL', () => {
    const url = getSearchUrl('Github', 'hello world');
    expect(url).toBe('https://github.com/search?type=Users&q=hello%20world');
  });

  test('generates MobyGames search URL', () => {
    const url = getSearchUrl('MobyGames', 'hello world');
    expect(url).toBe('https://www.mobygames.com/search/quick?q=hello%20world');
  });

  test('generates ArtStation search URL', () => {
    const url = getSearchUrl('ArtStation', 'hello world');
    expect(url).toBe(
      'https://www.artstation.com/search/artists?sort_by=followers&query=hello%20world'
    );
  });

  test('generates Behance search URL', () => {
    const url = getSearchUrl('Behance', 'hello world');
    expect(url).toBe('https://www.behance.net/search/users?search=hello%20world');
  });
});
