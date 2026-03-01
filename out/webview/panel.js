"use strict";
/**
 * Webview Panel Manager
 *
 * Manages the creation and lifecycle of the settings webview panel.
 * Handles panel state, messages, and disposal.
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
exports.CustomCopyWebviewPanel = void 0;
const vscode = __importStar(require("vscode"));
const provider_1 = require("./provider");
class CustomCopyWebviewPanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it
        if (CustomCopyWebviewPanel.currentPanel) {
            CustomCopyWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(CustomCopyWebviewPanel.viewType, 'Custom Copy Settings', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'out', 'webview-ui'),
            ],
        });
        CustomCopyWebviewPanel.currentPanel = new CustomCopyWebviewPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view state changes
        this._panel.onDidChangeViewState(() => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage((message) => {
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
        }, null, this._disposables);
    }
    _update() {
        const webview = this._panel.webview;
        webview.html = (0, provider_1.getWebviewContent)(webview, this._extensionUri);
    }
    _sendSettingsToWebview() {
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
    async _saveSettings(settings) {
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
    async _handleConfigChange(key, value) {
        const config = vscode.workspace.getConfiguration('customCopy');
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
    dispose() {
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
exports.CustomCopyWebviewPanel = CustomCopyWebviewPanel;
CustomCopyWebviewPanel.viewType = 'customCopySettings';
//# sourceMappingURL=panel.js.map