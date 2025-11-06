const { getSearchUrl, PLATFORM_URLS, PLATFORM_CONFIG } = require('./urls');

describe('getSearchUrl', () => {
  const query = 'hello world';
  const encodedQuery = encodeURIComponent(query);

  describe('URL generation for all platforms', () => {
    for (const [platform, baseUrl] of Object.entries(PLATFORM_URLS)) {
      test(`generates ${platform} search URL correctly`, () => {
        const url = getSearchUrl(platform, query);
        expect(url).toBe(`${baseUrl}${encodedQuery}`);
      });
    }
  });

  describe('special characters handling', () => {
    const specialQuery = 'test@#$%^&*()';

    test('encodes special characters correctly', () => {
      const url = getSearchUrl('Google', specialQuery);
      expect(url).toContain(encodeURIComponent(specialQuery));
    });
  });

  describe('empty query handling', () => {
    test('handles empty query', () => {
      const url = getSearchUrl('Google', '');
      expect(url).toBe(PLATFORM_URLS.Google);
    });
  });

  describe('invalid platform handling', () => {
    test('returns empty string for invalid platform', () => {
      const url = getSearchUrl('InvalidPlatform', query);
      expect(url).toBe('');
    });
  });

  describe('URL encoding edge cases', () => {
    test('encodes spaces as %20', () => {
      const url = getSearchUrl('Google', 'hello world');
      expect(url).toContain('hello%20world');
    });

    test('encodes quotes correctly', () => {
      const url = getSearchUrl('Google', '"exact phrase"');
      expect(url).toContain('%22exact%20phrase%22');
    });

    test('encodes plus signs correctly', () => {
      const url = getSearchUrl('Google', 'C++');
      expect(url).toContain('C%2B%2B');
    });
  });
});

describe('PLATFORM_URLS', () => {
  test('contains all expected platforms', () => {
    const expectedPlatforms = [
      'Linkedin',
      'Github',
      'MobyGames',
      'ArtStation',
      'Google',
      'Behance',
      'StackOverflow',
      'Twitter',
      'Reddit',
      'YouTube',
      'Medium',
      'DeviantArt',
      'Dribbble'
    ];

    expectedPlatforms.forEach((platform) => {
      expect(PLATFORM_URLS).toHaveProperty(platform);
      expect(typeof PLATFORM_URLS[platform]).toBe('string');
      expect(PLATFORM_URLS[platform]).toMatch(/^https?:\/\//);
    });
  });

  test('all URLs are HTTPS', () => {
    Object.values(PLATFORM_URLS).forEach((url) => {
      expect(url).toMatch(/^https:\/\//);
    });
  });

  test('all URLs end with query parameter or search path', () => {
    Object.values(PLATFORM_URLS).forEach((url) => {
      const hasQueryParam = url.includes('?') || url.includes('=');
      const hasSearchPath = url.includes('/search');
      expect(hasQueryParam || hasSearchPath).toBe(true);
    });
  });
});

describe('PLATFORM_CONFIG', () => {
  test('contains configuration for all platforms', () => {
    Object.keys(PLATFORM_URLS).forEach((platform) => {
      expect(PLATFORM_CONFIG).toHaveProperty(platform);
    });
  });

  test('each platform has required properties', () => {
    Object.entries(PLATFORM_CONFIG).forEach(([_platform, config]) => {
      expect(config).toHaveProperty('url');
      expect(config).toHaveProperty('tips');
      expect(config).toHaveProperty('icon');

      expect(typeof config.url).toBe('string');
      expect(typeof config.tips).toBe('string');
      expect(typeof config.icon).toBe('string');

      expect(config.url).toMatch(/^https:\/\//);
      expect(config.tips.length).toBeGreaterThan(0);
      expect(config.icon.length).toBeGreaterThan(0);
    });
  });

  test('PLATFORM_CONFIG URLs match PLATFORM_URLS', () => {
    Object.keys(PLATFORM_CONFIG).forEach((platform) => {
      expect(PLATFORM_CONFIG[platform].url).toBe(PLATFORM_URLS[platform]);
    });
  });

  test('all tips contain HTML formatting', () => {
    Object.values(PLATFORM_CONFIG).forEach((config) => {
      expect(config.tips).toMatch(/<strong>|<br>/);
    });
  });
});

describe('Platform-specific URL generation', () => {
  test('LinkedIn generates people search URL', () => {
    const url = getSearchUrl('Linkedin', 'John Doe');
    expect(url).toContain('linkedin.com/search/results/people');
    expect(url).toContain('keywords=');
  });

  test('GitHub generates users search URL', () => {
    const url = getSearchUrl('Github', 'octocat');
    expect(url).toContain('github.com/search');
    expect(url).toContain('type=Users');
  });

  test('Stack Overflow generates search URL', () => {
    const url = getSearchUrl('StackOverflow', 'javascript async');
    expect(url).toContain('stackoverflow.com/search');
  });

  test('Twitter generates search URL', () => {
    const url = getSearchUrl('Twitter', 'from:elonmusk');
    expect(url).toContain('twitter.com/search');
  });

  test('YouTube generates search URL', () => {
    const url = getSearchUrl('YouTube', 'coding tutorial');
    expect(url).toContain('youtube.com/results');
    expect(url).toContain('search_query=');
  });
});

describe('Module exports', () => {
  test('exports all required functions and objects', () => {
    expect(typeof getSearchUrl).toBe('function');
    expect(typeof PLATFORM_URLS).toBe('object');
    expect(typeof PLATFORM_CONFIG).toBe('object');
  });

  test('PLATFORM_URLS is not empty', () => {
    expect(Object.keys(PLATFORM_URLS).length).toBeGreaterThan(0);
  });

  test('PLATFORM_CONFIG is not empty', () => {
    expect(Object.keys(PLATFORM_CONFIG).length).toBeGreaterThan(0);
  });
});
