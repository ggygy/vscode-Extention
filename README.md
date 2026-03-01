# VS Code Custom Copy Extension

Copy file paths with line numbers in customizable format.

## Features

- **Copy with Path**: Copy the current file path along with line numbers using customizable keyboard shortcuts
- **Visual Settings Panel**: Configure formats and preferences through a React-based webview UI
- **Multiple Placeholders**: Support for various placeholders like `{path}`, `{line}`, `{lines}`, `{relativePath}`, `{absolutePath}`, etc.
- **Custom Formats**: Define multiple format templates for different use cases

## Installation

### From VSIX

1. Download the `vscode-custom-copy-0.1.0.vsix` file
2. Open VS Code
3. Go to the Extensions view (Ctrl+Shift+X)
4. Click on the "..." menu and select "Install from VSIX"
5. Select the downloaded file

### From Source

1. Clone the repository
2. Run `npm install`
3. Run `npm run compile`
4. Run `npm run build:webview`
5. Press F5 to open the Extension Development Host

## Usage

### Keyboard Shortcuts

| Command | Keybinding | Description |
|---------|------------|-------------|
| Copy with Path | `Ctrl+Shift+C` (Windows/Linux) / `Cmd+Shift+C` (Mac) | Copy current file path with line numbers |
| Open Settings Panel | Command Palette -> "Custom Copy: Open Settings Panel" | Open visual configuration UI |

### Available Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{path}` | File path (relative or absolute based on settings) | `src/components/App.tsx` |
| `{relativePath}` | Relative path from workspace root | `src/components/App.tsx` |
| `{absolutePath}` | Absolute file path | `/home/user/project/src/components/App.tsx` |
| `{line}` | Current line number | `42` |
| `{startLine}` | Start line of selection | `42` |
| `{endLine}` | End line of selection | `50` |
| `{lines}` | Line range (start-end if multi-line) | `42` or `42-50` |

### Format Examples

| Format String | Output |
|---------------|--------|
| `{path}:{line}` | `src/file.js:42` |
| `{path}#L{lines}` | `src/file.js#L42` or `src/file.js#L42-50` |
| `[{relativePath}:{startLine}]({absolutePath})` | `[src/file.js:42](/home/user/project/src/file.js)` |

## Configuration

### VS Code Settings

Open VS Code settings (File > Preferences > Settings) and search for "Custom Copy":

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `customCopy.pathType` | `enum` | `relative` | Path type: `relative` or `absolute` |
| `customCopy.format` | `string` | `{path}:{line}` | Default format template |

### Settings Panel

Open the visual settings panel from the Command Palette:

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Custom Copy: Open Settings Panel"
3. Configure formats visually with live preview

## Development

### Project Structure

```
vscode-custom-copy/
├── src/                      # Extension source code
│   ├── extension.ts          # Extension entry point
│   ├── commands.ts           # Command implementations
│   ├── config.ts             # Configuration management
│   ├── formatter.ts          # Format string parser
│   └── webview/              # Webview panel management
│       ├── panel.ts
│       └── provider.ts
├── webview-ui/               # React webview UI
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── out/                      # Compiled output
│   ├── extension.js          # Compiled extension
│   └── webview-ui/           # Built webview UI
├── package.json
└── tsconfig.json
```

### Build Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile TypeScript extension |
| `npm run watch` | Watch mode for extension |
| `npm run build:webview` | Build webview UI |
| `npm run vscode:prepublish` | Pre-publish build (both) |
| `npm run package` | Create .vsix package |
| `npm run test` | Run tests |

### Debug

1. Open the project in VS Code
2. Press `F5` to start debugging
3. A new Extension Development Host window will open
4. Test the extension commands

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/your-publisher/vscode-custom-copy/issues).

---

**Enjoy!** If you find this extension helpful, please consider [rating it on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=your-publisher.vscode-custom-copy).
