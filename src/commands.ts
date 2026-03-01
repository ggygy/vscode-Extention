/**
 * Commands Module
 *
 * Implements the copy command with path and line number formatting.
 * Handles text selection, path resolution, and clipboard operations.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { getConfig, PathType } from './config';
import { parseFormat, FormatContext } from './formatter';

/**
 * Gets the appropriate path based on the configured path type.
 *
 * @param uri - The file URI
 * @param pathType - The path type configuration
 * @returns The formatted path
 */
function getFilePath(uri: vscode.Uri, pathType: PathType): string {
  if (pathType === 'absolute') {
    return uri.fsPath;
  }

  // For relative path, calculate from workspace root
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }

  // Fallback to absolute if no workspace
  return uri.fsPath;
}

/**
 * Gets the absolute path for a file.
 *
 * @param uri - The file URI
 * @returns The absolute path
 */
function getAbsolutePath(uri: vscode.Uri): string {
  return uri.fsPath;
}

/**
 * Gets the relative path from workspace root.
 *
 * @param uri - The file URI
 * @returns The relative path or absolute if no workspace
 */
function getRelativePath(uri: vscode.Uri): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }
  return uri.fsPath;
}

/**
 * Gets line numbers from the current text editor selection.
 *
 * @param editor - The text editor
 * @returns Object containing startLine, endLine (1-based, inclusive)
 */
function getLineNumbers(editor: vscode.TextEditor): {
  startLine: number;
  endLine: number;
} {
  const selection = editor.selection;
  // Handle reversed selections (user selected from bottom to top)
  const startLine = Math.min(selection.start.line, selection.end.line) + 1; // Convert to 1-based
  const endLine = Math.max(selection.start.line, selection.end.line) + 1;

  return { startLine, endLine };
}

/**
 * Builds the format context for the current editor state.
 *
 * @param editor - The text editor
 * @param config - The extension configuration
 * @returns The format context
 */
function buildFormatContext(
  editor: vscode.TextEditor,
  config: { pathType: PathType; format: string }
): FormatContext {
  const document = editor.document;
  const uri = document.uri;
  const { startLine, endLine } = getLineNumbers(editor);

  return {
    relativePath: getRelativePath(uri),
    absolutePath: getAbsolutePath(uri),
    startLine,
    endLine,
    pathType: config.pathType,
  };
}

/**
 * Executes the copy with path command.
 * Copies the formatted string with file path and line numbers to the clipboard.
 *
 * @returns Promise that resolves when the copy operation is complete
 */
export async function copyWithPathCommand(): Promise<void> {
  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active text editor');
    return;
  }

  // Check if the document is untitled (not saved)
  if (editor.document.isUntitled) {
    vscode.window.showWarningMessage('Please save the file first');
    return;
  }

  // Get configuration
  const config = getConfig();

  // Build format context
  const context = buildFormatContext(editor, config);

  // Parse format string
  const result = parseFormat({ format: config.format, context });

  // Copy to clipboard
  await vscode.env.clipboard.writeText(result);

  // Show success message
  vscode.window.showInformationMessage(`Copied: ${result}`);
}
