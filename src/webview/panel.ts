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
          case 'getSettings':
            this._sendSettingsToWebview();
            break;
          case 'saveSettings':
            this._saveSettings(message.payload);
            break;
          case 'configChange':
            this._handleConfigChange(message.key, message.value);
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
  }

  private _sendSettingsToWebview(): void {
    const config = vscode.workspace.getConfiguration('customCopy');

    // Convert VSCode config to ExtensionSettings format
    const settings = {
      formats: [
        {
          name: 'Default',
          format: config.get('format', '{path}:{line}'),
          enabled: true,
          placeholders: []
        }
      ],
      defaultFormat: 'Default',
      enabled: true
    };

    this._panel.webview.postMessage({
      type: 'settings',
      payload: settings
    });
  }

  private async _saveSettings(settings: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('customCopy');

    // Extract format from the first format in settings
    if (settings.formats && settings.formats.length > 0) {
      const format = settings.formats[0].format;
      await config.update('format', format, vscode.ConfigurationTarget.Global);
    }

    // Send confirmation back to webview
    this._panel.webview.postMessage({
      type: 'settingsSaved',
      payload: null
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
