import React, { useCallback, useState } from 'react';
import type { ExtensionSettings, FormatConfig, PlaceholderConfig } from '../types/webview';
import { FormatInput } from './FormatInput';
import { Preview } from './Preview';
import { PlaceholderSelector } from './PlaceholderSelector';

interface SettingsProps {
  settings: ExtensionSettings;
  onChange: (settings: ExtensionSettings) => void;
  onSave: () => void;
}

// Default sample data for preview
const defaultSampleData = {
  relative: 'src/components/App.tsx',
  absolute: '/home/user/project/src/components/App.tsx',
  basename: 'App.tsx',
  extname: '.tsx',
  filename: 'App',
  content: 'const greeting = "Hello World";',
  'start-line': '42',
  'end-line': '45'
};

// Available placeholders
const availablePlaceholders: PlaceholderConfig[] = [
  { key: 'relative', description: 'Relative file path', example: 'src/file.ts' },
  { key: 'absolute', description: 'Absolute file path', example: '/home/user/src/file.ts' },
  { key: 'basename', description: 'File name with extension', example: 'file.ts' },
  { key: 'extname', description: 'File extension', example: '.ts' },
  { key: 'filename', description: 'File name without extension', example: 'file' },
  { key: 'content', description: 'Selected content', example: 'console.log("hello")' },
  { key: 'start-line', description: 'Start line number', example: '10' },
  { key: 'end-line', description: 'End line number', example: '20' }
];

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onChange,
  onSave
}) => {
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFormatChange = useCallback((index: number, updatedFormat: FormatConfig) => {
    const newFormats = [...settings.formats];
    newFormats[index] = updatedFormat;
    onChange({ ...settings, formats: newFormats });
    setHasChanges(true);
  }, [settings, onChange]);

  const handleAddFormat = useCallback(() => {
    const newFormat: FormatConfig = {
      name: `New Format ${settings.formats.length + 1}`,
      format: '[{relative}:{start-line}] {content}',
      enabled: true,
      placeholders: []
    };
    onChange({
      ...settings,
      formats: [...settings.formats, newFormat]
    });
    setHasChanges(true);
  }, [settings, onChange]);

  const handleDeleteFormat = useCallback((index: number) => {
    const newFormats = settings.formats.filter((_, i) => i !== index);
    onChange({ ...settings, formats: newFormats });
    setHasChanges(true);
  }, [settings, onChange]);

  const handleSave = useCallback(() => {
    onSave();
    setHasChanges(false);
  }, [onSave]);

  const activeFormat = activeFormatId
    ? settings.formats.find(f => f.name === activeFormatId) || settings.formats[0]
    : settings.formats[0];

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Custom Copy Settings</h1>
        <div className="header-actions">
          {hasChanges && (
            <span className="unsaved-indicator">Unsaved changes</span>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Settings
          </button>
        </div>
      </header>

      <div className="settings-content">
        <section className="formats-section">
          <div className="section-header">
            <h2>Formats</h2>
            <button className="btn btn-secondary" onClick={handleAddFormat}>
              + Add Format
            </button>
          </div>

          <div className="formats-list">
            {settings.formats.map((format, index) => (
              <FormatInput
                key={format.name}
                format={format}
                onChange={(updatedFormat) => handleFormatChange(index, updatedFormat)}
                onDelete={() => handleDeleteFormat(index)}
              />
            ))}
          </div>
        </section>

        <section className="preview-section">
          <div className="section-header">
            <h2>Preview</h2>
          </div>

          <div className="preview-content-wrapper">
            <PlaceholderSelector
              placeholders={availablePlaceholders}
              onSelect={(placeholder) => {
                console.log('Selected placeholder:', placeholder);
                // This would insert the placeholder into the active format input
              }}
            />

            {activeFormat && (
              <Preview
                format={activeFormat.format}
                sampleData={defaultSampleData}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
