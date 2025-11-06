# Contributing to Multi-Platform Search Extension

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding New Platforms](#adding-new-platforms)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a positive community

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Chrome browser (for testing)
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/multi-platform-search-extension.git
   cd multi-platform-search-extension
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

## Development Workflow

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `bugfix/description`
- Enhancements: `enhance/description`

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add YouTube platform support
fix: Resolve search history loading issue
docs: Update README with new features
refactor: Extract CSS to separate file
test: Add tests for URL encoding
```

Prefix types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `style`: Code style changes (formatting)
- `chore`: Maintenance tasks

## Adding New Platforms

To add a new search platform, follow these steps:

### 1. Update `urls.js`

Add the platform configuration to the `PLATFORM_CONFIG` object:

```javascript
const PLATFORM_CONFIG = {
  // ... existing platforms
  NewPlatform: {
    url: 'https://newplatform.com/search?q=',
    tips: `<strong>NewPlatform Operators:</strong><br>
      - <strong>operator1:</strong> Description<br>
      - <strong>operator2:</strong> Description`,
    icon: '🔥'
  }
};
```

### 2. Update `popup.html`

Add a button for the new platform:

```html
<button id="searchNewPlatform">🔥 New Platform</button>
```

### 3. No Changes Needed!

That's it! The extension will automatically:
- Create event listeners for the button
- Add context menu items
- Include the platform in settings

### 4. Test Your Changes

```bash
npm test
```

Add specific tests for your platform in `popup.test.js` if needed.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests are written using Jest. Example:

```javascript
describe('NewPlatform', () => {
  test('generates correct search URL', () => {
    const url = getSearchUrl('NewPlatform', 'test query');
    expect(url).toContain('newplatform.com/search');
  });
});
```

### Test Coverage Requirements

- New features should include tests
- Aim for >80% code coverage
- Test edge cases and error scenarios

## Code Style

### ESLint

We use ESLint for code quality:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier

We use Prettier for code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Style Guidelines

- Use JSDoc comments for all functions
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Add meaningful error messages
- Handle all Chrome API errors

Example:

```javascript
/**
 * Generate a search URL for a given platform and query
 * @param {string} platform - The platform name
 * @param {string} query - The search query
 * @returns {string} The complete search URL
 */
function getSearchUrl(platform, query) {
  const encodedQuery = encodeURIComponent(query);
  return PLATFORM_URLS[platform] ? `${PLATFORM_URLS[platform]}${encodedQuery}` : '';
}
```

## Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```

2. **Test manually:**
   - Load extension in Chrome
   - Test your changes thoroughly
   - Check console for errors
   - Test in different scenarios

3. **Update documentation:**
   - Update README.md if needed
   - Add entry to CHANGELOG.md
   - Update JSDoc comments

### Submitting PR

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature
   ```

2. Create a Pull Request on GitHub

3. Fill out the PR template:
   - Clear title and description
   - List of changes
   - Screenshots (if UI changes)
   - Testing steps
   - Related issues

### PR Review Process

- Maintainers will review your PR
- Address feedback and requested changes
- Once approved, your PR will be merged
- Your contribution will be added to CHANGELOG.md

## Project Structure

```
multi-platform-search-extension/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── manifest.json               # Extension manifest
├── popup.html                  # Popup UI
├── popup.css                   # Popup styles
├── popup.js                    # Popup logic
├── background.js               # Background service worker
├── urls.js                     # Platform configuration
├── options.html                # Options page UI
├── options.css                 # Options page styles
├── options.js                  # Options page logic
├── popup.test.js               # Jest tests
├── package.json                # NPM configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc.json            # Prettier configuration
└── README.md                   # Documentation
```

## Key Design Principles

1. **Data-Driven Architecture:** Platform configuration is centralized in `urls.js`
2. **User Customization:** All features can be configured in options page
3. **Error Handling:** All Chrome API calls include error handling
4. **Accessibility:** Keyboard shortcuts and proper ARIA labels
5. **Testing:** Comprehensive test coverage for all features
6. **Documentation:** JSDoc comments for all functions

## Getting Help

- Check existing issues on GitHub
- Review documentation in README.md
- Ask questions in pull request comments
- Contact maintainers if needed

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)

## Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in release notes
- Added to contributors list (future)

Thank you for contributing to Multi-Platform Search Extension! 🎉
