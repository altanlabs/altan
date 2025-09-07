import { ContentCopy, ExpandMore } from '@mui/icons-material';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import FieldConfig from './configs/FieldConfig';
import { FIELD_TYPES } from './utils/fieldTypes';
import FieldTypeSelector from './utils/FieldTypeSelector';
import getDefaultConfig from './utils/getDefaultConfig';
import { RESERVED_WORDS } from './utils/reservedWords';
import { updateFieldThunk, selectTableRecordsTotal } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store.js';
import CustomDialog from '../../dialogs/CustomDialog.jsx';

export default function EditFieldDialog({ field, baseId, tableId, open, onClose }) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [fieldConfig, setFieldConfig] = useState({});
  const [fieldNameError, setFieldNameError] = useState('');

  // Get the total number of records in the table
  const recordsTotal = useSelector((state) => selectTableRecordsTotal(state, tableId));

  useEffect(() => {
    if (field) {
      setFieldName(field.name);
      setFieldType(field.type);
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
      const updateData = {
        name: fieldName.trim(),
        options: fieldConfig,
      };

      // Only include type if it has changed and table is empty
      if (fieldType !== field.type && recordsTotal === 0) {
        updateData.type = fieldType;
      }

      dispatch(updateFieldThunk(tableId, field.id, updateData));
      onClose();
    } catch {
      // Error will be handled by Redux
    }
  }, [field, fieldName, fieldType, fieldConfig, fieldNameError, recordsTotal, tableId, onClose]);

  const handleFieldNameChange = (e) => {
    const newName = e.target.value;
    setFieldName(newName);
    setFieldNameError(validateFieldName(newName));
  };

  const handleFieldTypeChange = (newType) => {
    setFieldType(newType);
    // Reset field config to default for the new type
    setFieldConfig(getDefaultConfig(newType));
  };

  // Check if field type can be changed (table has no records)
  const canChangeFieldType = recordsTotal === 0;

  // Get the current field type display name
  const currentFieldTypeName = FIELD_TYPES.find(type => type.id === fieldType)?.name || fieldType;

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
            {canChangeFieldType ? (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="field-type-content"
                  id="field-type-header"
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: '4px 4px 0 0',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Field type
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 2, fontWeight: 500 }}>
                    {currentFieldTypeName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <FieldTypeSelector onSelect={handleFieldTypeChange} />
                </AccordionDetails>
              </Accordion>
            ) : (
              <TextField
                label="Field type"
                variant="filled"
                size="small"
                fullWidth
                value={currentFieldTypeName}
                disabled
                helperText={recordsTotal > 0 ? `Cannot change type - table has ${recordsTotal} record${recordsTotal === 1 ? '' : 's'}` : ''}
              />
            )}
          </div>

          {field && (
            <FieldConfig
              type={fieldType}
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
              fieldType === field?.type &&
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
