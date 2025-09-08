import { ContentCopy } from '@mui/icons-material';
import { 
  Stack, 
  TextField, 
  Drawer, 
  Typography, 
  IconButton, 
  InputAdornment,
  Autocomplete,
  Box
} from '@mui/material';
import { useCallback, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import FieldConfig from './configs/FieldConfig';
import { FIELD_TYPES } from './utils/fieldTypes';
import getDefaultConfig from './utils/getDefaultConfig';
import { RESERVED_WORDS } from './utils/reservedWords';
import { updateFieldThunk, selectTableRecordsTotal } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store.js';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';

const EditFieldDrawer = ({ baseId, tableId, field, open, onClose }) => {
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

  const handleClose = useCallback(() => {
    setFieldName('');
    setFieldType('');
    setFieldConfig({});
    setFieldNameError('');
    onClose();
  }, [onClose]);

  // Check if field type can be changed (table has no records)
  const canChangeFieldType = recordsTotal === 0;

  // Get the current field type display name and icon
  const currentFieldType = FIELD_TYPES.find(type => type.id === fieldType);
  const currentFieldTypeName = currentFieldType?.name || fieldType;
  const FieldTypeIcon = currentFieldType?.icon;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          marginLeft: { sm: '400px' }, // Stack next to the table drawer
          zIndex: 1400, // Higher than the table drawer
        },
      }}
      BackdropProps={{
        invisible: true, // Hide backdrop since we're stacking
      }}
    >
      <Stack sx={{ height: '100%' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
        >
          <CardTitle>Edit Field</CardTitle>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mdi:close" width={20} height={20} />
          </IconButton>
        </Stack>

        {/* Content */}
        <Stack sx={{ flex: 1, p: 3, gap: 3, overflow: 'auto' }}>
          {/* Field Name */}
          <TextField
            label="Field Name"
            variant="outlined"
            fullWidth
            value={fieldName}
            onChange={handleFieldNameChange}
            error={!!fieldNameError}
            helperText={fieldNameError}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
              },
            }}
          />

          {/* Database Field Name */}
          <TextField
            label="Database Field Name"
            variant="outlined"
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
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
              },
            }}
          />

          {/* Field Type */}
          <Autocomplete
            options={FIELD_TYPES}
            getOptionLabel={(option) => option.name}
            value={currentFieldType || null}
            onChange={(event, newValue) => {
              if (newValue) {
                handleFieldTypeChange(newValue.id);
              }
            }}
            disabled={!canChangeFieldType}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Field Type"
                variant="outlined"
                helperText={
                  !canChangeFieldType && recordsTotal > 0
                    ? `Cannot change type - table has ${recordsTotal} record${recordsTotal === 1 ? '' : 's'}`
                    : ''
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: !canChangeFieldType ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1,
                }}
              >
                <option.icon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Stack>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  {option.badge && (
                    <Typography variant="caption" color="primary.main">
                      {option.badge}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
            sx={{
              '& .MuiAutocomplete-inputRoot': {
                paddingLeft: '14px !important',
              },
            }}
          />

          {/* Field Configuration */}
          {field && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Field Configuration
              </Typography>
              <FieldConfig
                type={fieldType}
                config={fieldConfig}
                onChange={setFieldConfig}
                tableId={field.table_id}
                baseId={baseId}
              />
            </Stack>
          )}

          {/* Field Info */}
          <Stack
            sx={{
              padding: 2,
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(25, 118, 210, 0.2)',
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(25, 118, 210, 0.9)' }}>
              💡 Changes to field configuration will affect how data is displayed and validated.
            </Typography>
          </Stack>
        </Stack>

        {/* Footer Actions */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            p: 3,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <InteractiveButton
            variant="outlined"
            title="Cancel"
            onClick={handleClose}
            containerClassName="h-[40px]"
            borderClassName="h-[40px] w-[100px]"
            enableBorder={false}
          />
          <InteractiveButton
            icon="mdi:check"
            title="Save Changes"
            onClick={handleSubmit}
            duration={8000}
            containerClassName="h-[40px]"
            borderClassName="h-[40px] w-[150px]"
            enableBorder={true}
            disabled={
              !fieldName.trim() ||
              (fieldName === field?.name &&
                fieldType === field?.type &&
                JSON.stringify(fieldConfig) === JSON.stringify(field?.options)) ||
              !!fieldNameError
            }
          />
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default memo(EditFieldDrawer);
