import React from 'react';
import { Check } from 'lucide-react';
import './ColorSelector.css';

export default function ColorSelector({
  colors = [],
  selectedColor,
  onSelectColor,
}) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="color-selector">
      <div className="selector-header">
        <span className="selector-label">Atelier Palette:</span>
        <span className="selector-current-value">{selectedColor || 'Select a shade'}</span>
      </div>

      <div className="color-pills-wrap">
        {colors.map((color) => {
          const isSelected = selectedColor?.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              className={`color-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectColor(color)}
              aria-label={`Select ${color}`}
            >
              {isSelected && <Check size={14} className="color-check-icon" />}
              <span className="color-name">{color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
