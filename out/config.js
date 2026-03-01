"use strict";
/**
 * Configuration Management Module
 *
 * Manages extension configuration with VS Code settings API.
 * Provides typed access to configuration values and change notifications.
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
exports.DEFAULT_CONFIG = exports.CONFIG_SECTION = void 0;
exports.getConfig = getConfig;
exports.updateConfig = updateConfig;
exports.resetConfig = resetConfig;
exports.onConfigChange = onConfigChange;
const vscode = __importStar(require("vscode"));
/** Configuration section prefix */
exports.CONFIG_SECTION = 'customCopy';
/** Default configuration values */
exports.DEFAULT_CONFIG = {
    pathType: 'relative',
    format: '{path}:{lines}',
};
/**
 * Gets the current extension configuration.
 *
 * @returns The current extension configuration
 */
function getConfig() {
    const config = vscode.workspace.getConfiguration(exports.CONFIG_SECTION);
    return {
        pathType: config.get('pathType', exports.DEFAULT_CONFIG.pathType),
        format: config.get('format', exports.DEFAULT_CONFIG.format),
    };
}
/**
 * Updates the extension configuration.
 *
 * @param key - The configuration key to update
 * @param value - The new value
 * @param target - The configuration target (global or workspace)
 */
async function updateConfig(key, value, target = vscode.ConfigurationTarget.Global) {
    const config = vscode.workspace.getConfiguration(exports.CONFIG_SECTION);
    await config.update(key, value, target);
}
/**
 * Resets configuration to default values.
 *
 * @param target - The configuration target (global or workspace)
 */
async function resetConfig(target = vscode.ConfigurationTarget.Global) {
    const config = vscode.workspace.getConfiguration(exports.CONFIG_SECTION);
    await config.update('pathType', undefined, target);
    await config.update('format', undefined, target);
}
/**
 * Watches for configuration changes.
 *
 * @param callback - Function to call when configuration changes
 * @returns Disposable to stop watching
 */
function onConfigChange(callback) {
    return vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(exports.CONFIG_SECTION)) {
            callback(getConfig());
        }
    });
}
//# sourceMappingURL=config.js.map