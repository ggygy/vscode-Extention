import React, { useState, useCallback } from 'react';
import type { FormatConfig } from '../types/webview';

interface FormatInputProps {
  format: FormatConfig;
  onChange: (format: FormatConfig) => void;
  onDelete?: () => void;
}

export const FormatInput: React.FC<FormatInputProps> = ({
  format,
  onChange,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...format, name: e.target.value });
  }, [format, onChange]);

  const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...format, format: e.target.value });
  }, [format, onChange]);

  const handleEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...format, enabled: e.target.checked });
  }, [format, onChange]);

  return (
    <div className={`format-input ${format.enabled ? '' : 'disabled'}`}>
      <div className="format-input-header" onClick={() => setIsExpanded(!isExpanded)}>
        <input
          type="checkbox"
          checked={format.enabled}
          onChange={handleEnabledChange}
          onClick={(e) => e.stopPropagation()}
        />
        <input
          type="text"
          value={format.name}
          onChange={handleNameChange}
          placeholder="Format name"
          className="format-name-input"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>

        {onDelete && (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="format-input-body">
          <label>Format Template:</label>
          <textarea
            value={format.format}
            onChange={handleFormatChange}
            placeholder="Enter format template, e.g., [{relative}]: {content}"
            rows={4}
          />
          <div className="format-help">
            <small>
              Available placeholders: {'{relative}'}, {'{absolute}'}, {'{basename}'}, {'{extname}'},
              {'{filename}'}, {'{content}'}, {'{start-line}'}, {'{end-line}'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};
