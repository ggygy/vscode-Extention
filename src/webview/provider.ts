/**
 * Webview Content Provider
 *
 * Provides the HTML content for the settings webview panel.
 * Serves the built React app from the webview-ui directory.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Gets the HTML content for the webview panel.
 *
 * @param webview - The webview instance
 * @param extensionUri - The extension URI for resolving resource paths
 * @returns The complete HTML content
 */
export function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  // Get the path to the built webview-ui files
  const webviewUiPath = vscode.Uri.joinPath(extensionUri, 'out', 'webview-ui');

  // Try to load the built index.html from webview-ui
  const indexPath = path.join(webviewUiPath.fsPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    // Production mode: serve the built React app
    return loadBuiltApp(webview, extensionUri, indexPath);
  } else {
    // Development mode: show a placeholder with instructions
    return getDevelopmentPlaceholder();
  }
}

/**
 * Loads the built React app and adapts it for VS Code webview.
 */
function loadBuiltApp(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  indexPath: string
): string {
  let html = fs.readFileSync(indexPath, 'utf-8');

  // Get the webview-ui asset directory
  const webviewUiPath = vscode.Uri.joinPath(extensionUri, 'out', 'webview-ui');
  const webviewUiUri = webview.asWebviewUri(webviewUiPath);

  // Replace asset paths with webview-safe URIs
  // Handle both relative paths and absolute paths
  html = html.replace(
    /(src|href)=["']([^"']*)["']/g,
    (match, attr, src) => {
      // Skip external URLs and data URIs
      if (
        src.startsWith('http') ||
        src.startsWith('data:') ||
        src.startsWith('vscode-webview:')
      ) {
        return match;
      }

      // Remove leading ./ or / for relative paths
      const cleanSrc = src.replace(/^\.\//, '').replace(/^\//, '');
      const assetUri = vscode.Uri.joinPath(webviewUiUri, cleanSrc);
      return `${attr}="${assetUri}"`;
    }
  );

  // Add the VS Code API script at the beginning of body
  const vscodeApiScript = `
    <script>
      // Acquire VS Code API for messaging
      const vscode = acquireVsCodeApi();

      // Store state
      let currentConfig = null;

      // Listen for messages from the extension
      window.addEventListener('message', (event) => {
        const message = event.data;

        switch (message.type) {
          case 'config':
            currentConfig = message.data;
            // Dispatch custom event for React app
            window.dispatchEvent(new CustomEvent('vscode:config', {
              detail: message.data
            }));
            break;
        }
      });

      // Helper function to send messages to extension
      window.vscodePostMessage = (type, data) => {
        vscode.postMessage({ type, ...data });
      };
    </script>
  `;

  // Insert the VS Code API script before the closing head tag or at the start of body
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${vscodeApiScript}</head>`);
  } else {
    html = html.replace('<body>', `<body>${vscodeApiScript}`);
  }

  return html;
}

/**
 * Returns a placeholder HTML for development mode when the webview-ui is not built.
 */
function getDevelopmentPlaceholder(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Copy Settings</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      font-size: 1.5em;
      margin-bottom: 1em;
      color: var(--vscode-textLink-foreground);
    }
    .info {
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textBlockQuote-border);
      padding: 15px;
      margin: 1em 0;
    }
    code {
      font-family: var(--vscode-editor-font-family);
      background-color: var(--vscode-textCodeBlock-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    .placeholder-list {
      margin-top: 1em;
    }
    .placeholder-list li {
      margin: 0.5em 0;
    }
    .key {
      color: var(--vscode-symbolColor-classForeground);
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Custom Copy Settings</h1>

    <div class="info">
      <strong>Development Mode:</strong> The webview UI is not built yet.
      <br><br>
      To see the full settings panel, build the webview UI by running:
      <br>
      <code>cd webview-ui && npm install && npm run build</code>
    </div>

    <h2>Current Configuration</h2>
    <p>
      Use the VS Code settings to configure the extension:
    </p>
    <ul>
      <li><code>customCopy.pathType</code> - "relative" or "absolute"</li>
      <li><code>customCopy.format</code> - Format string with placeholders</li>
    </ul>

    <h2>Available Placeholders</h2>
    <ul class="placeholder-list">
      <li><code class="key">{path}</code> - File path (relative or absolute)</li>
      <li><code class="key">{relativePath}</code> - Relative path from workspace root</li>
      <li><code class="key">{absolutePath}</code> - Absolute file path</li>
      <li><code class="key">{line}</code> - Start line number</li>
      <li><code class="key">{startLine}</code> - Start line number</li>
      <li><code class="key">{endLine}</code> - End line number</li>
      <li><code class="key">{lines}</code> - Line range (e.g., "42" or "42-50")</li>
    </ul>

    <h2>Example Formats</h2>
    <ul>
      <li><code>{path}:{line}</code> - "src/file.ts:42"</li>
      <li><code>{path}#L{lines}</code> - "src/file.ts#L42-50"</li>
      <li><code>{relativePath}:{line}</code> - "file.ts:42"</li>
    </ul>
  </div>
</body>
</html>
  `;
}
