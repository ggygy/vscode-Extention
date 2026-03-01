/**
 * Extension Entry Point
 *
 * This is the main entry point for the VS Code extension.
 * It registers commands, sets up event listeners, and initializes the extension state.
 */

import * as vscode from 'vscode';
import { copyWithPathCommand } from './commands';
import { onConfigChange } from './config';
import { CustomCopyWebviewPanel } from './webview/panel';

// Command identifiers (must match package.json)
const COMMAND_COPY_WITH_PATH = 'customCopy.copyWithPath';
const COMMAND_OPEN_SETTINGS = 'customCopy.openSettings';

/**
 * Activates the extension.
 * This function is called when the extension is first loaded.
 *
 * @param context - The extension context for registering disposables
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Custom Copy extension is now active');

  // Register the copy with path command
  const copyCommand = vscode.commands.registerCommand(
    COMMAND_COPY_WITH_PATH,
    copyWithPathCommand
  );

  // Register the open settings command
  const settingsCommand = vscode.commands.registerCommand(
    COMMAND_OPEN_SETTINGS,
    () => {
      CustomCopyWebviewPanel.createOrShow(context.extensionUri);
    }
  );

  // Watch for configuration changes
  const configWatcher = onConfigChange((config) => {
    console.log('Configuration changed:', config);
    // Configuration changes are handled automatically by the commands
    // This is useful for future enhancements like real-time preview updates
  });

  // Register all disposables
  context.subscriptions.push(
    copyCommand,
    settingsCommand,
    configWatcher
  );

  // Show a welcome message on first activation
  showWelcomeMessage(context);
}

/**
 * Deactivates the extension.
 * This function is called when the extension is shut down.
 */
export function deactivate(): void {
  console.log('Custom Copy extension is now deactivated');
  // Clean up resources if needed
}

/**
 * Shows a welcome message when the extension is first activated.
 *
 * @param context - The extension context
 */
async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
  const hasShownWelcome = context.globalState.get<boolean>('customCopy.welcomeShown');

  if (!hasShownWelcome) {
    const result = await vscode.window.showInformationMessage(
      'Custom Copy is now active! Use Ctrl+Shift+C (Cmd+Shift+C on Mac) to copy file paths with line numbers.',
      'Open Settings',
      'Got it'
    );

    if (result === 'Open Settings') {
      vscode.commands.executeCommand('customCopy.openSettings');
    }

    await context.globalState.update('customCopy.welcomeShown', true);
  }
}
