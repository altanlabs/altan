import { ContentCopy } from '@mui/icons-material';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';

import FieldConfig from './configs/FieldConfig';
// import { FIELD_TYPES } from './utils/fieldTypes';
import getDefaultConfig from './utils/getDefaultConfig';
import { RESERVED_WORDS } from './utils/reservedWords';
import { updateFieldThunk } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store.js';
import CustomDialog from '../../dialogs/CustomDialog.jsx';

export default function EditFieldDialog({ field, baseId, tableId, open, onClose }) {
  const [fieldName, setFieldName] = useState('');
  const [fieldConfig, setFieldConfig] = useState({});
  const [fieldNameError, setFieldNameError] = useState('');

  useEffect(() => {
    if (field) {
      setFieldName(field.name);
      setFieldConfig(field.options || getDefaultConfig(field.type));
    }
  }, [field]);

  const validateFieldName = (name) => {
    if (!name.trim()) {
      return 'Field name is required';
    }
    if (RESERVED_WORDS.has(name.toLowerCase())) {
      return 'This name is reserved and cannot be used';
    }
    return '';
  };

  const handleSubmit = useCallback(async () => {
    if (!fieldName.trim() || !field || fieldNameError) return;

    try {
      dispatch(
        updateFieldThunk(tableId, field.id, {
          name: fieldName.trim(),
          options: fieldConfig,
        }),
      );
      onClose();
    } catch (error) {
      console.error('Failed to update field:', error);
    }
  }, [field, fieldName, fieldConfig, fieldNameError, onClose]);

  const handleFieldNameChange = (e) => {
    const newName = e.target.value;
    setFieldName(newName);
    setFieldNameError(validateFieldName(newName));
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <DialogTitle>Edit Field</DialogTitle>
      <DialogContent className="space-y-4 mt-6">
        <div className="space-y-4">
          <div>
            <TextField
              label="Field Name"
              variant="filled"
              size="small"
              fullWidth
              value={fieldName}
              onChange={handleFieldNameChange}
              error={!!fieldNameError}
              helperText={fieldNameError}
            />
          </div>

          <div>
            <TextField
              label="Database Field Name"
              variant="filled"
              size="small"
              fullWidth
              disabled
              value={field?.db_field_name || ''}
              InputProps={{
                readOnly: true,
                onClick: (e) => e.target.select(),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(field?.db_field_name || '');
                      }}
                      edge="end"
                      size="small"
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div>
            <TextField
              label="Field type"
              variant="filled"
              size="small"
              fullWidth
              value={field?.type || ''}
              disabled
            />
          </div>

          {field && (
            <FieldConfig
              type={field.type}
              config={fieldConfig}
              onChange={setFieldConfig}
              tableId={field.table_id}
              baseId={baseId}
            />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !fieldName.trim() ||
            (fieldName === field?.name &&
              JSON.stringify(fieldConfig) === JSON.stringify(field?.options)) ||
            !!fieldNameError
          }
        >
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
