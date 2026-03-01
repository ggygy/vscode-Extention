/**
 * Configuration Management Module
 *
 * Manages extension configuration with VS Code settings API.
 * Provides typed access to configuration values and change notifications.
 */

import * as vscode from 'vscode';

/** Configuration section prefix */
export const CONFIG_SECTION = 'customCopy';

/** Path type configuration */
export type PathType = 'relative' | 'absolute';

/** Extension configuration interface */
export interface ExtensionConfig {
  /** Path type to use: 'relative' or 'absolute' */
  pathType: PathType;
  /** Format string with placeholders */
  format: string;
}

/** Default configuration values */
export const DEFAULT_CONFIG: ExtensionConfig = {
  pathType: 'relative',
  format: '{path}:{lines}',
};

/**
 * Gets the current extension configuration.
 *
 * @returns The current extension configuration
 */
export function getConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

  return {
    pathType: config.get<PathType>('pathType', DEFAULT_CONFIG.pathType),
    format: config.get<string>('format', DEFAULT_CONFIG.format),
  };
}

/**
 * Updates the extension configuration.
 *
 * @param key - The configuration key to update
 * @param value - The new value
 * @param target - The configuration target (global or workspace)
 */
export async function updateConfig(
  key: keyof ExtensionConfig,
  value: string,
  target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
): Promise<void> {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  await config.update(key, value, target);
}

/**
 * Resets configuration to default values.
 *
 * @param target - The configuration target (global or workspace)
 */
export async function resetConfig(
  target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
): Promise<void> {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  await config.update('pathType', undefined, target);
  await config.update('format', undefined, target);
}

/**
 * Watches for configuration changes.
 *
 * @param callback - Function to call when configuration changes
 * @returns Disposable to stop watching
 */
export function onConfigChange(
  callback: (config: ExtensionConfig) => void
): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(CONFIG_SECTION)) {
      callback(getConfig());
    }
  });
}
