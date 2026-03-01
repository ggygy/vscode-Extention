import React, { useState, useCallback } from 'react';
import type { PlaceholderConfig } from '../types/webview';

interface PlaceholderSelectorProps {
  placeholders: PlaceholderConfig[];
  onSelect: (placeholder: string) => void;
}

export const PlaceholderSelector: React.FC<PlaceholderSelectorProps> = ({
  placeholders,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelect = useCallback((key: string) => {
    onSelect(`{${key}}`);
    setIsOpen(false);
    setSearchTerm('');
  }, [onSelect]);

  // Categorize placeholders
  const categories: Record<string, PlaceholderConfig[]> = {
    'Path': [],
    'Content': [],
    'Line Numbers': [],
    'Other': []
  };

  placeholders.forEach(p => {
    if (['relative', 'absolute', 'basename', 'extname', 'filename'].includes(p.key)) {
      categories['Path'].push(p);
    } else if (p.key === 'content') {
      categories['Content'].push(p);
    } else if (['start-line', 'end-line'].includes(p.key)) {
      categories['Line Numbers'].push(p);
    } else {
      categories['Other'].push(p);
    }
  });

  // Filter placeholders based on search
  const filterPlaceholders = (items: PlaceholderConfig[]) => {
    return items.filter(p =>
      p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="placeholder-selector">
      <button
        className="placeholder-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        Insert Placeholder {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div className="placeholder-dropdown">
          <input
            type="text"
            placeholder="Search placeholders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="placeholder-search"
          />

          <div className="placeholder-categories">
            {Object.entries(categories).map(([category, items]) => {
              const filteredItems = filterPlaceholders(items);
              if (filteredItems.length === 0) return null;

              return (
                <div key={category} className="placeholder-category">
                  <h4>{category}</h4>
                  <ul>
                    {filteredItems.map((placeholder) => (
                      <li key={placeholder.key}>
                        <button
                          onClick={() => handleSelect(placeholder.key)}
                          className="placeholder-item"
                          type="button"
                          title={`{${placeholder.key}} - ${placeholder.description}`}
                        >
                          <code>{`{${placeholder.key}}`}</code>
                          <span className="placeholder-desc">{placeholder.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
