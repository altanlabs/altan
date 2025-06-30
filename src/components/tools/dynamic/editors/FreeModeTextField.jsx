import TextField from '@mui/material/TextField';
import { memo, useCallback } from 'react';

import VarsEditor from '../../../flows/modules/VarsEditor';

const FreeModeTextField = ({
  fieldKey,
  schema,
  title,
  value,
  onChange,
  enableLexical = false,
  expanded = false,
  sx = null,
}) => {
  // if (["array", "object"].includes(schema.type)) {
  //   return null;
  // }
  const onTextFieldChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return schema.const || !enableLexical ? (
    <TextField
      multiline
      // label={title}
      value={value || ''}
      disabled={!!schema.const || schema['x-disabled']}
      onChange={onTextFieldChange}
      fullWidth
      variant="filled"
      size="small"
      sx={{
        ...(sx ?? {}),
      }}
      hiddenLabel
      placeholder={`write ${title ?? fieldKey}...`}
      InputProps={{
        inputProps: {
          sx: {
            '&::placeholder': {
              fontStyle: 'italic',
              fontSize: '0.8rem',
              opacity: 0.7,
            },
          },
        },
      }}
      // sx={{maxWidth: 500}}
    />
  ) : (
    <VarsEditor
      value={(typeof value === 'object' ? JSON.stringify(value, null, 4) : value) || ''}
      onChange={onChange}
      maxHeight={expanded ? '100%' : '300px'}
    />
  );
};

export default memo(FreeModeTextField);
