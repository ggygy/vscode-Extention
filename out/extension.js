"use strict";
/**
 * Extension Entry Point
 *
 * This is the main entry point for the VS Code extension.
 * It registers commands, sets up event listeners, and initializes the extension state.
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const commands_1 = require("./commands");
const config_1 = require("./config");
const panel_1 = require("./webview/panel");
// Command identifiers (must match package.json)
const COMMAND_COPY_WITH_PATH = 'customCopy.copyWithPath';
const COMMAND_OPEN_SETTINGS = 'customCopy.openSettings';
/**
 * Activates the extension.
 * This function is called when the extension is first loaded.
 *
 * @param context - The extension context for registering disposables
 */
function activate(context) {
    console.log('Custom Copy extension is now active');
    // Register the copy with path command
    const copyCommand = vscode.commands.registerCommand(COMMAND_COPY_WITH_PATH, commands_1.copyWithPathCommand);
    // Register the open settings command
    const settingsCommand = vscode.commands.registerCommand(COMMAND_OPEN_SETTINGS, () => {
        panel_1.CustomCopyWebviewPanel.createOrShow(context.extensionUri);
    });
    // Watch for configuration changes
    const configWatcher = (0, config_1.onConfigChange)((config) => {
        console.log('Configuration changed:', config);
        // Configuration changes are handled automatically by the commands
        // This is useful for future enhancements like real-time preview updates
    });
    // Register all disposables
    context.subscriptions.push(copyCommand, settingsCommand, configWatcher);
    // Show a welcome message on first activation
    showWelcomeMessage(context);
}
/**
 * Deactivates the extension.
 * This function is called when the extension is shut down.
 */
function deactivate() {
    console.log('Custom Copy extension is now deactivated');
    // Clean up resources if needed
}
/**
 * Shows a welcome message when the extension is first activated.
 *
 * @param context - The extension context
 */
async function showWelcomeMessage(context) {
    const hasShownWelcome = context.globalState.get('customCopy.welcomeShown');
    if (!hasShownWelcome) {
        const result = await vscode.window.showInformationMessage('Custom Copy is now active! Use Ctrl+Shift+C (Cmd+Shift+C on Mac) to copy file paths with line numbers.', 'Open Settings', 'Got it');
        if (result === 'Open Settings') {
            vscode.commands.executeCommand('customCopy.openSettings');
        }
        await context.globalState.update('customCopy.welcomeShown', true);
    }
}
//# sourceMappingURL=extension.js.map