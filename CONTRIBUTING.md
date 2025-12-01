# Contributing to Moneybag Node.js SDK

We welcome contributions to the Moneybag Node.js SDK! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Process

### Code Style

- We use TypeScript for all source code
- Follow the existing code style enforced by ESLint and Prettier
- Run `npm run lint` to check for linting errors
- Run `npm run format` to format your code

### Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass: `npm test`
- Maintain test coverage above 80%: `npm run test:coverage`

### Commit Messages

Follow the conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

Example:
```
feat(checkout): add support for recurring payments

Added is_recurring field to checkout request
Updated validation to handle recurring payment options
```

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update the README.md with details of changes if applicable
3. Update the CHANGELOG.md following the Keep a Changelog format
4. Ensure all tests pass and coverage requirements are met
5. Submit a pull request with a clear description of changes

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Provide clear descriptions and steps to reproduce for bugs
- Include relevant code snippets or error messages

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing opinions and experiences

## Questions?

If you have questions about contributing, please open an issue or contact the maintainers.

Thank you for contributing to Moneybag Node.js SDK!