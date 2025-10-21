# Contributing to YouTube Downloader TS

Thank you for your interest in contributing to YouTube Downloader TS! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- FFmpeg (for testing video/audio muxing)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/youtube-downloader-ts.git
   cd youtube-downloader-ts
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Link for local development:
   ```bash
   npm link
   ```

## 🛠️ Development Workflow

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Build in watch mode
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build files

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test your changes:
   ```bash
   npm run build
   npm run test
   npm run lint
   ```
4. Commit your changes:
   ```bash
   git commit -m "Add: your feature description"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

## 📝 Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Provide proper type annotations
- Use interfaces for object shapes
- Prefer `const` over `let` when possible
- Use meaningful variable and function names

### Code Formatting

- Use ESLint configuration provided in the project
- Follow the existing code style
- Use 2 spaces for indentation
- Use single quotes for strings

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(cli): add support for custom output directory
fix(downloader): handle network timeout errors
docs(readme): update installation instructions
```

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass
- Use descriptive test names
- Test edge cases and error conditions

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format

### Pull Request Template

When creating a PR, please include:

1. **Description**: What changes does this PR make?
2. **Type of Change**: Bug fix, feature, documentation, etc.
3. **Testing**: How was this tested?
4. **Breaking Changes**: Any breaking changes?
5. **Checklist**: Confirm all items are completed

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: How to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node.js version, etc.
6. **Additional Context**: Any other relevant information

### Feature Requests

For feature requests, please include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why is this feature needed?
3. **Proposed Solution**: How should it work?
4. **Alternatives**: Any alternative solutions considered?

## 📚 Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Update API documentation for code changes
- Add examples for new features
- Keep installation instructions current

### Documentation Standards

- Use clear, concise language
- Provide code examples
- Include screenshots for UI changes
- Keep documentation up-to-date with code changes

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns to: [security-email]
3. Include detailed information about the vulnerability
4. Allow time for the maintainers to respond

## 📞 Getting Help

### Questions and Support

- Open an issue for questions
- Check existing issues and discussions
- Join our community discussions (if available)

### Communication Guidelines

- Be respectful and inclusive
- Use clear, descriptive language
- Provide context for questions
- Help others when possible

## 🎯 Areas for Contribution

### High Priority

- Bug fixes
- Performance improvements
- Documentation updates
- Test coverage improvements

### Medium Priority

- New features
- Code refactoring
- CLI enhancements
- Error handling improvements

### Low Priority

- UI/UX improvements
- Additional format support
- Advanced features

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to YouTube Downloader TS! 🎉
