# Changelog

All notable changes to the "vscode-custom-copy" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Add support for custom placeholder functions
- Add export/import settings functionality
- Add more built-in format templates
- Add keyboard shortcut customization in settings panel

## [0.1.0] - 2025-03-01

### Added
- Initial release of VS Code Custom Copy extension
- Copy file path with line numbers using customizable keyboard shortcuts (Ctrl+Shift+C / Cmd+Shift+C)
- Visual settings panel built with React + Vite for easy configuration
- Support for multiple placeholders: {path}, {line}, {lines}, {relativePath}, {absolutePath}, etc.
- Custom format templates for different use cases
- Path type configuration (relative or absolute)
- Real-time preview in settings panel
- Placeholder selector with categorized options
- Webview UI with VS Code theme integration
- Full TypeScript support with type definitions
- ESLint configuration for code quality
- Complete documentation in README.md

### Technical
- Extension core built with TypeScript and VS Code Extension API
- Webview UI built with React 18, Vite 5, and TypeScript
- Dual build system: tsc for extension, Vite for webview UI
- Communication protocol between extension and webview
- State management and persistence
- Error handling and logging

## Release Checklist

### Pre-release
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md with new version
- [ ] Run all tests and ensure they pass
- [ ] Build extension and verify output
- [ ] Test in Extension Development Host
- [ ] Update README.md if needed

### Release
- [ ] Create git tag for version
- [ ] Package extension with `vsce package`
- [ ] Test .vsix installation
- [ ] Publish to VS Code Marketplace (if public)
- [ ] Create GitHub release with notes

### Post-release
- [ ] Verify extension on Marketplace
- [ ] Update documentation
- [ ] Announce release (if applicable)

---

## Contributing to Changelog

When making changes, add an entry under the [Unreleased] section following this format:

```markdown
### Added
- New feature X that does Y

### Changed
- Modified existing feature Z to do W

### Deprecated
- Feature X is now deprecated and will be removed in version Y

### Removed
- Feature X has been removed

### Fixed
- Bug in feature X that caused Y

### Security
- Security vulnerability X has been patched
```
