import React from 'react';

interface PreviewProps {
  format: string;
  sampleData: {
    relative?: string;
    absolute?: string;
    basename?: string;
    extname?: string;
    filename?: string;
    content?: string;
    'start-line'?: string;
    'end-line'?: string;
    [key: string]: string | undefined;
  };
}

export const Preview: React.FC<PreviewProps> = ({ format, sampleData }) => {
  const processFormat = (template: string, data: PreviewProps['sampleData']): string => {
    let result = template;

    // Replace placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.split(placeholder).join(value || '');
    });

    // Handle any remaining placeholders
    result = result.replace(/\{[^}]+\}/g, '');

    return result;
  };

  const previewText = processFormat(format, sampleData);

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3>Preview</h3>
      </div>
      <div className="preview-content">
        <pre>{previewText}</pre>
      </div>
      <div className="preview-data">
        <h4>Sample Data:</h4>
        <ul>
          {Object.entries(sampleData).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value || 'N/A'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
