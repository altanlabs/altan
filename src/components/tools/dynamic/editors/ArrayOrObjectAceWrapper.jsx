import { memo } from 'react';

import RichAceEditor from './RichAceEditor.jsx';

const ArrayOrObjectAceWrapper = ({ expanded, fieldKey, fieldType, value, onChange }) => {
  // Map fieldType to Monaco mode
  const getMode = (type) => {
    if (type === 'object' || type === 'array') {
      return 'json';
    }
    return 'javascript'; // fallback
  };

  return (
    <div
      style={{
        height: expanded ? '100%' : '500px',
        minHeight: '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <RichAceEditor
        fieldKey={fieldKey}
        mode={getMode(fieldType)}
        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        onChange={(newValue) => {
          console.log(`ArrayOrObjectAceWrapper onChange for ${fieldKey}:`, { newValue, fieldType });
          
          if (fieldType !== 'object' && fieldType !== 'array') {
            onChange(newValue);
            return;
          }

          // Handle empty/null values
          if (!newValue || newValue.trim() === '') {
            const emptyValue = fieldType === 'object' ? {} : [];
            console.log(`Setting empty ${fieldType}:`, emptyValue);
            onChange(emptyValue);
            return;
          }

          try {
            const parsed = JSON.parse(newValue);
            console.log(`Successfully parsed ${fieldType}:`, parsed);
            onChange(parsed);
          } catch (error) {
            console.warn(`Invalid JSON for ${fieldType}, not updating:`, error.message, newValue);
            // Don't call onChange with invalid data - this prevents the string from being saved
          }
        }}
      />
    </div>
  );
};

export default memo(ArrayOrObjectAceWrapper);
