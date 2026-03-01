import React, { useState, useCallback, useEffect } from 'react';
import { Settings } from './components/Settings';
import { useVsCodeApi, useExtensionMessage } from './hooks/useVsCodeApi';
import type { ExtensionSettings, WebviewMessage, ExtensionMessage } from './types/webview';
import './App.css';

// Default settings
const defaultSettings: ExtensionSettings = {
  formats: [
    {
      name: 'Default',
      format: '[{relative}:{start-line}]({absolute})\n\n{content}',
      enabled: true,
      placeholders: []
    },
    {
      name: 'Simple',
      format: '{relative}:{start-line}-{end-line}',
      enabled: true,
      placeholders: []
    }
  ],
  defaultFormat: 'Default',
  enabled: true
};

export const App: React.FC = () => {
  const { isReady, postMessage, setState, getState } = useVsCodeApi();
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial settings from extension
  useEffect(() => {
    if (!isReady) return;

    // Request settings from extension
    postMessage({
      type: 'getSettings',
      payload: null
    });
  }, [isReady, postMessage]);

  // Handle messages from extension
  useExtensionMessage((message: ExtensionMessage) => {
    switch (message.type) {
      case 'settings': {
        const loadedSettings = message.payload as ExtensionSettings;
        setSettings(loadedSettings);
        setState({ settings: loadedSettings });
        setIsLoading(false);
        break;
      }

      case 'settingsSaved': {
        // Settings saved successfully
        setError(null);
        // Could show a success notification here
        break;
      }

      case 'error': {
        const errorMessage = message.payload as string;
        setError(errorMessage);
        break;
      }

      default:
        console.log('Unknown message type:', message.type);
    }
  });

  const handleSettingsChange = useCallback((newSettings: ExtensionSettings) => {
    setSettings(newSettings);
    setState({ settings: newSettings });
  }, [setState]);

  const handleSave = useCallback(() => {
    postMessage({
      type: 'saveSettings',
      payload: settings
    });
  }, [postMessage, settings]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <span>Error: {error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <Settings
        settings={settings}
        onChange={handleSettingsChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default App;
