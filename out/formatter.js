"use strict";
/**
 * Format Parser Module
 *
 * Parses format strings with placeholders and replaces them with actual values.
 * Supported placeholders:
 * - {path}: File path (relative or absolute based on config)
 * - {relativePath}: Relative path from workspace root
 * - {absolutePath}: Absolute path
 * - {line}: Start line number
 * - {startLine}: Start line number
 * - {endLine}: End line number
 * - {lines}: Line number or range (e.g., "42" or "42-50")
 * - {path:norm}: Normalized path with forward slashes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFormat = parseFormat;
exports.getAvailablePlaceholders = getAvailablePlaceholders;
exports.getAvailableModifiers = getAvailableModifiers;
/**
 * Normalizes a path by converting backslashes to forward slashes.
 */
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}
/**
 * Gets the appropriate path based on path type configuration.
 */
function getPath(context) {
    return context.pathType === 'absolute'
        ? context.absolutePath
        : context.relativePath;
}
/**
 * Gets the line range string (e.g., "42" or "42-50").
 */
function getLines(context) {
    if (context.startLine === context.endLine) {
        return String(context.startLine);
    }
    return `${context.startLine}-${context.endLine}`;
}
/**
 * Processes a placeholder with optional modifier.
 * Supported modifiers:
 * - :norm - Normalize path (forward slashes)
 */
function processPlaceholder(placeholder, modifier, context) {
    let value;
    switch (placeholder) {
        case 'path':
            value = getPath(context);
            break;
        case 'relativePath':
            value = context.relativePath;
            break;
        case 'absolutePath':
            value = context.absolutePath;
            break;
        case 'line':
        case 'startLine':
            value = String(context.startLine);
            break;
        case 'endLine':
            value = String(context.endLine);
            break;
        case 'lines':
            value = getLines(context);
            break;
        default:
            // Unknown placeholder, return as-is
            return `{${placeholder}${modifier ? ':' + modifier : ''}}`;
    }
    // Apply modifier
    if (modifier === 'norm') {
        value = normalizePath(value);
    }
    return value;
}
/**
 * Parses a format string and replaces placeholders with actual values.
 *
 * @param options - Parse options containing format string and context
 * @returns The formatted string with placeholders replaced
 *
 * @example
 * ```typescript
 * const result = parseFormat({
 *   format: '{path}:{line}',
 *   context: {
 *     relativePath: 'src/index.ts',
 *     absolutePath: '/home/user/project/src/index.ts',
 *     startLine: 42,
 *     endLine: 50,
 *     pathType: 'relative'
 *   }
 * });
 * // result: 'src/index.ts:42'
 * ```
 */
function parseFormat(options) {
    const { format, context } = options;
    // Regular expression to match placeholders like {path}, {line}, {path:norm}, etc.
    const placeholderRegex = /\{(\w+)(?::(\w+))?\}/g;
    return format.replace(placeholderRegex, (match, placeholder, modifier) => {
        return processPlaceholder(placeholder, modifier || null, context);
    });
}
/**
 * Gets the list of available placeholders for documentation purposes.
 */
function getAvailablePlaceholders() {
    return [
        {
            name: 'path',
            description: 'File path (relative or absolute based on pathType config)',
            example: 'src/index.ts or /home/user/project/src/index.ts',
        },
        {
            name: 'relativePath',
            description: 'Relative path from workspace root',
            example: 'src/index.ts',
        },
        {
            name: 'absolutePath',
            description: 'Absolute file path',
            example: '/home/user/project/src/index.ts',
        },
        {
            name: 'line',
            description: 'Start line number (same as startLine)',
            example: '42',
        },
        {
            name: 'startLine',
            description: 'Start line number (1-based)',
            example: '42',
        },
        {
            name: 'endLine',
            description: 'End line number (1-based, inclusive)',
            example: '50',
        },
        {
            name: 'lines',
            description: 'Line number or range (e.g., "42" or "42-50")',
            example: '42 or 42-50',
        },
    ];
}
/**
 * Gets the list of available modifiers for documentation purposes.
 */
function getAvailableModifiers() {
    return [
        {
            name: 'norm',
            description: 'Normalize path with forward slashes',
            applicableTo: ['path', 'relativePath', 'absolutePath'],
        },
    ];
}
//# sourceMappingURL=formatter.js.map