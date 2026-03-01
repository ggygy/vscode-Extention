/**
 * Webview Panel Manager
 *
 * Manages the creation and lifecycle of the settings webview panel.
 * Handles panel state, messages, and disposal.
 */

import * as vscode from 'vscode';
import { getWebviewContent } from './provider';

export class CustomCopyWebviewPanel {
  public static currentPanel: CustomCopyWebviewPanel | undefined;
  public static readonly viewType = 'customCopySettings';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (CustomCopyWebviewPanel.currentPanel) {
      CustomCopyWebviewPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      CustomCopyWebviewPanel.viewType,
      'Custom Copy Settings',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out', 'webview-ui'),
        ],
      }
    );

    CustomCopyWebviewPanel.currentPanel = new CustomCopyWebviewPanel(
      panel,
      extensionUri
    );
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view state changes
    this._panel.onDidChangeViewState(
      () => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case 'configChange':
            this._handleConfigChange(message.key, message.value);
            break;
          case 'requestConfig':
            this._sendConfigToWebview();
            break;
          case 'resetConfig':
            this._resetConfig();
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private _update(): void {
    const webview = this._panel.webview;
    webview.html = getWebviewContent(webview, this._extensionUri);
    // Send current config to webview after it loads
    setTimeout(() => this._sendConfigToWebview(), 100);
  }

  private _sendConfigToWebview(): void {
    const config = vscode.workspace.getConfiguration('customCopy');
    this._panel.webview.postMessage({
      type: 'config',
      data: {
        pathType: config.get('pathType', 'relative'),
        format: config.get('format', '{path}:{line}'),
      },
    });
  }

  private async _handleConfigChange(
    key: string,
    value: string
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration('customCopy');
    await config.update(
      key,
      value,
      vscode.ConfigurationTarget.Global
    );
  }

  private async _resetConfig(): Promise<void> {
    const config = vscode.workspace.getConfiguration('customCopy');
    await config.update('pathType', undefined, true);
    await config.update('format', undefined, true);
    this._sendConfigToWebview();
  }

  public dispose(): void {
    CustomCopyWebviewPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
