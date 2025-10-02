import { ContentCopy } from '@mui/icons-material';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Autocomplete,
  Box,
  Stack,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { POSTGRES_TYPES } from './utils/postgresTypes';
import { RESERVED_WORDS } from './utils/reservedWords';
import { updateFieldThunk, selectTableRecordsTotal } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store.js';
import CustomDialog from '../../dialogs/CustomDialog.jsx';

/**
 * @deprecated Use EditFieldDrawer instead for a better stacked drawer experience.
 * This dialog component will be removed in a future version.
 *
 * @see EditFieldDrawer - Provides the same functionality with improved UX
 */
export default function EditFieldDialog({ field, tableId, open, onClose }) {
  const [fieldName, setFieldName] = useState('');
  const [postgresType, setPostgresType] = useState(null);
  const [isNullable, setIsNullable] = useState(true);
  const [isUnique, setIsUnique] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [comment, setComment] = useState('');
  const [fieldNameError, setFieldNameError] = useState('');

  // Get the total number of records in the table
  const recordsTotal = useSelector((state) => selectTableRecordsTotal(state, tableId));

  useEffect(() => {
    if (field) {
      setFieldName(field.name);
      // Find the matching PostgreSQL type from the list
      const matchingType = POSTGRES_TYPES.find((type) => type.type === field.data_type);
      setPostgresType(matchingType || null);
      setIsNullable(field.is_nullable !== false);
      setIsUnique(field.is_unique || false);
      setDefaultValue(field.default_value || '');
      setComment(field.comment || '');
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
    if (!fieldName.trim() || !postgresType || !field || fieldNameError) return;

    try {
      const updateData = {
        name: fieldName.trim().toLowerCase(),
        is_nullable: isNullable,
        is_unique: isUnique,
        comment: comment || null,
      };

      // Only add default_value if provided
      if (defaultValue) {
        updateData.default_value = defaultValue;
      }

      // Only include type if it has changed and table is empty
      if (postgresType.type !== field.data_type && recordsTotal === 0) {
        updateData.type = postgresType.type;
      }

      await dispatch(updateFieldThunk(tableId, field.id, updateData));
      onClose();
    } catch (error) {
      // Error will be handled by Redux
      // eslint-disable-next-line no-console
      console.error('Error updating field:', error);
    }
  }, [
    field,
    fieldName,
    postgresType,
    isNullable,
    isUnique,
    defaultValue,
    comment,
    fieldNameError,
    recordsTotal,
    tableId,
    onClose,
  ]);

  const handleFieldNameChange = (e) => {
    const newName = e.target.value;
    setFieldName(newName);
    setFieldNameError(validateFieldName(newName));
  };

  // Check if field type can be changed (table has no records)
  const canChangeFieldType = recordsTotal === 0;

  // Check if anything has changed
  const hasChanges =
    fieldName.trim().toLowerCase() !== field?.name ||
    postgresType?.type !== field?.data_type ||
    isNullable !== (field?.is_nullable !== false) ||
    isUnique !== (field?.is_unique || false) ||
    defaultValue !== (field?.default_value || '') ||
    comment !== (field?.comment || '');

  return (
    <CustomDialog dialogOpen={open} onClose={onClose}>
      <DialogTitle>Edit Field</DialogTitle>
      <DialogContent className="space-y-4 mt-6">
        <Stack spacing={3}>
          {/* Field Name */}
          <TextField
            label="Field Name"
            variant="filled"
            size="small"
            fullWidth
            value={fieldName}
            onChange={handleFieldNameChange}
            error={!!fieldNameError}
            helperText={fieldNameError || 'Will be converted to lowercase (PostgreSQL convention)'}
          />

          {/* Database Field Name (Read-only) */}
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

          {/* PostgreSQL Type */}
          <Autocomplete
            options={POSTGRES_TYPES}
            getOptionLabel={(option) => option.name}
            value={postgresType}
            onChange={(event, newValue) => {
              setPostgresType(newValue);
            }}
            disabled={!canChangeFieldType}
            groupBy={(option) => option.category}
            renderInput={(params) => (
              <TextField
                {...params}
                label="PostgreSQL Type"
                variant="filled"
                size="small"
                helperText={
                  !canChangeFieldType
                    ? `Cannot change type - table has ${recordsTotal} record${recordsTotal === 1 ? '' : 's'}`
                    : undefined
                }
              />
            )}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <option.icon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Stack sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {option.name}
                      </Typography>
                      <Chip label={option.type} size="small" sx={{ height: 20, fontSize: '11px' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            )}
          />

          {/* Constraints */}
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Constraints
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={isNullable} onChange={(e) => setIsNullable(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body2">Allow NULL values</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Field can be empty
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={<Checkbox checked={isUnique} onChange={(e) => setIsUnique(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body2">Unique constraint</Typography>
                  <Typography variant="caption" color="text.secondary">
                    All values must be different
                  </Typography>
                </Box>
              }
            />
          </Stack>

          {/* Default Value */}
          <TextField
            label="Default Value (optional)"
            variant="filled"
            size="small"
            fullWidth
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="e.g., 0, 'pending', NOW()"
            helperText="PostgreSQL expression (use single quotes for strings)"
          />

          {/* Comment */}
          <TextField
            label="Comment (optional)"
            variant="filled"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what this field is for..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!fieldName.trim() || !postgresType || !!fieldNameError || !hasChanges}
        >
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
