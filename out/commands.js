"use strict";
/**
 * Commands Module
 *
 * Implements the copy command with path and line number formatting.
 * Handles text selection, path resolution, and clipboard operations.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyWithPathCommand = copyWithPathCommand;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const formatter_1 = require("./formatter");
/**
 * Gets the appropriate path based on the configured path type.
 *
 * @param uri - The file URI
 * @param pathType - The path type configuration
 * @returns The formatted path
 */
function getFilePath(uri, pathType) {
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
function getAbsolutePath(uri) {
    return uri.fsPath;
}
/**
 * Gets the relative path from workspace root.
 *
 * @param uri - The file URI
 * @returns The relative path or absolute if no workspace
 */
function getRelativePath(uri) {
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
function getLineNumbers(editor) {
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
function buildFormatContext(editor, config) {
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
async function copyWithPathCommand() {
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
    const config = (0, config_1.getConfig)();
    // Build format context
    const context = buildFormatContext(editor, config);
    // Parse format string
    const result = (0, formatter_1.parseFormat)({ format: config.format, context });
    // Copy to clipboard
    await vscode.env.clipboard.writeText(result);
    // Show success message
    vscode.window.showInformationMessage(`Copied: ${result}`);
}
//# sourceMappingURL=commands.js.map