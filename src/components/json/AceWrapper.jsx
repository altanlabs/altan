import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const AceWrapper = ({
  value,
  fieldType = 'object',
  onChange = null,
  onError = null,
  readOnly = false,
}) => {
  const theme = useTheme();
  const [lintError, setLintError] = useState(null);

  // Helper to safely parse the initial value
  const parseInitialValue = useCallback(() => {
    if (value === undefined || value === null) {
      return fieldType === 'object' ? {} : [];
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Invalid JSON provided in "value" prop:', error);
        return fieldType === 'object' ? {} : [];
      }
    }
    return value;
  }, [value, fieldType]);

  // Local state for the JSON data
  const [data, setData] = useState(parseInitialValue);

  // Update internal state if the external value changes
  useEffect(() => {
    setData(parseInitialValue());
  }, [value, parseInitialValue]);

  // Handle data updates from the Editor
  const handleChange = useCallback(
    (newValue) => {
      try {
        // Try to parse the new value as JSON
        const jsonData = JSON.parse(newValue);
        setData(jsonData);
        setLintError(null);
        if (onChange) {
          onChange(jsonData);
        }
      } catch (err) {
        // If it's not valid JSON, update the error state
        setLintError({
          message: err.message,
          line: err.lineNumber,
          column: err.columnNumber,
        });
        if (onError) {
          onError({
            error: err,
            currentValue: newValue,
          });
        }
      }
    },
    [onChange, onError],
  );

  // Format the data for display
  const formattedValue = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (err) {
      console.error('Error stringifying data:', err);
      return '';
    }
  }, [data]);

  const monacoTheme = theme.palette.mode === 'light' ? 'light' : 'vs-dark';

  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        position: 'relative',
      }}
    >
      <Editor
        height="100%"
        defaultLanguage="json"
        value={formattedValue}
        onChange={handleChange}
        theme={monacoTheme}
        options={{
          readOnly,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          fontSize: 12,
          tabSize: 2,
          wordWrap: 'on',
          wrappingStrategy: 'advanced',
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: true,
            alwaysConsumeMouseWheel: false,
          },
          overviewRulerBorder: false,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: 'all',
          contextmenu: true,
        }}
      />
      {lintError && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
          }}
        >
          <strong>JSON Error:</strong>{' '}
          {`Line ${lintError.line || '?'} Column ${lintError.column || '?'}: ${lintError.message}`}
        </div>
      )}
    </div>
  );
};

AceWrapper.propTypes = {
  /** The JSON data to be displayed/edited. Can be a string, object, or array */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
  /** Defines the type of the root data (object or array) */
  fieldType: PropTypes.oneOf(['object', 'array']),
  /** Callback when the JSON data is changed. Returns a formatted JSON string */
  onChange: PropTypes.func,
  /** Callback to be executed on error with detailed error information */
  onError: PropTypes.func,
  /** If true, editing will be disabled */
  readOnly: PropTypes.bool,
};

export default memo(AceWrapper);

// import { useTheme } from '@mui/material';
// import { memo, useMemo } from 'react';
// import AceEditor from 'react-ace';
// import 'ace-builds/src-min-noconflict/ext-language_tools';
// import 'ace-builds/src-noconflict/theme-solarized_dark';
// import 'ace-builds/src-noconflict/theme-github';
// import 'ace-builds/src-noconflict/mode-json';

// const AceWrapper = ({
//   name,
//   value,
//   fieldType = 'object',
//   fullHeight = false,
//   onChange = null,
//   readOnly = false,
//   style = {},
// }) => {
//   const theme = useTheme();

//   //   const objectValue = !!value ? (value instanceof Object ? JSON.stringify(value, null, '\t') : value) : (fieldType === "object" ? "{}" : "[]");
//   const objectValue = useMemo(() => {
//     if (!value) {
//       return fieldType === 'object' ? '{}' : '[]';
//     }
//     if (value instanceof Object) {
//       return JSON.stringify(value, null, '\t');
//     }
//     // Convert any other type to string
//     return String(value);
//   }, [fieldType, value]);

//   const numberLines = objectValue.split('\n').length || 1;
//   const aceTheme = theme.palette.mode === 'light' ? 'github' : 'solarized_dark';

//   return (
//     <AceEditor
//       style={{
//         borderRadius: 10,
//         minHeight: 0,
//         ...style,
//       }}
//       placeholder="Placeholder Text"
//       mode="json"
//       height={!fullHeight ? `${numberLines * 1.24}rem` : '100%'}
//       width="100%"
//       theme={aceTheme}
//       name={name}
//       // onLoad={this.onLoad}
//       onChange={onChange}
//       fontSize={14}
//       showPrintMargin={false}
//       showGutter={false}
//       highlightActiveLine={true}
//       value={objectValue}
//       setOptions={{
//         maxLines: Infinity,
//         enableBasicAutocompletion: false,
//         enableLiveAutocompletion: false,
//         enableSnippets: false,
//         showLineNumbers: true,
//         tabSize: 2,
//         minLines: 2,
//         readOnly,
//       }}
//     />
//   );
// };

// export default memo(AceWrapper);
