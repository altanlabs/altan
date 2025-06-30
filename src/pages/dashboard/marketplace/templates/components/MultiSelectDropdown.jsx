import React, { useState } from 'react';

import Iconify from '../../../../../components/iconify';

const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      return options.find((opt) => opt.value === selectedValues[0])?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-input border border-divider rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:bg-action-hover"
      >
        <div className="flex items-center justify-between">
          <span className={selectedValues.length === 0 ? 'text-text-secondary' : 'text-primary'}>
            {getDisplayText()}
          </span>
          <Iconify
            icon={isOpen ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
            width={16}
            className="text-text-secondary"
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-divider rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-action-hover cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="mr-3 w-4 h-4 text-primary border-divider rounded focus:ring-primary"
              />
              <span className="text-sm text-primary">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
