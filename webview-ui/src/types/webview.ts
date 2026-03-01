/**
 * TypeScript types for webview UI state and messages
 */

// Message types for VSCode <-> Webview communication
export interface WebviewMessage {
  type: string;
  payload?: unknown;
}

export interface ExtensionMessage {
  type: string;
  payload?: unknown;
}

// Format configuration type
export interface FormatConfig {
  name: string;
  format: string;
  enabled: boolean;
  placeholders: PlaceholderConfig[];
}

export interface PlaceholderConfig {
  key: string;
  description: string;
  example: string;
}

// Extension settings type
export interface ExtensionSettings {
  formats: FormatConfig[];
  defaultFormat: string;
  enabled: boolean;
}

// Webview state
export interface WebviewState {
  settings: ExtensionSettings;
  selectedFormat: string;
  isDirty: boolean;
}

// Message type guards
export function isExtensionMessage(msg: unknown): msg is ExtensionMessage {
  return (
    typeof msg === 'object' &amp;&amp;
    msg !== null &amp;&amp;
    'type' in msg &amp;&amp;
    typeof (msg as ExtensionMessage).type === 'string'
  );
}
