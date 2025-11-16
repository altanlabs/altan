import { ContentCopy } from '@mui/icons-material';
import {
  Stack,
  TextField,
  Drawer,
  Typography,
  IconButton,
  InputAdornment,
  Autocomplete,
  Box,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
} from '@mui/material';
import { useCallback, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { POSTGRES_TYPES } from './utils/postgresTypes';
import { RESERVED_WORDS } from './utils/reservedWords';
import { updateFieldById, selectTableRecordsTotal, selectTableById } from '../../../redux/slices/bases.ts';
import { dispatch } from '../../../redux/store.ts';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';

const EditFieldDrawer = ({ tableId, baseId, field, open, onClose }) => {
  const [fieldName, setFieldName] = useState('');
  const [postgresType, setPostgresType] = useState(null);
  const [isNullable, setIsNullable] = useState(true);
  const [isUnique, setIsUnique] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [comment, setComment] = useState('');
  const [fieldNameError, setFieldNameError] = useState('');

  // Get the total number of records in the table
  const recordsTotal = useSelector((state) => selectTableRecordsTotal(state, tableId));

  // Get the table object to access relationships
  const table = useSelector((state) => selectTableById(state, baseId, tableId));
  // Check if this field is a foreign key
  // Note: pg-meta relationships don't have constraint_type, but all relationships from pg-meta are foreign keys
  const foreignKeyRelationship = table?.relationships?.find(
    (rel) => rel.source_column_name === field?.db_field_name,
  );

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

  const handleClose = useCallback(() => {
    setFieldName('');
    setPostgresType(null);
    setIsNullable(true);
    setIsUnique(false);
    setDefaultValue('');
    setComment('');
    setFieldNameError('');
    onClose();
  }, [onClose]);

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

      await dispatch(updateFieldById(baseId, tableId, field.id, updateData));
      handleClose();
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
    handleClose,
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
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(18, 18, 18, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
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
          sx={{
            p: 3,
            borderBottom: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          }}
        >
          <CardTitle>Edit Field</CardTitle>
          <IconButton
            onClick={handleClose}
            size="small"
          >
            <Iconify
              icon="mdi:close"
              width={20}
              height={20}
            />
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
            helperText={fieldNameError || 'Will be converted to lowercase (PostgreSQL convention)'}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
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
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
              },
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
                variant="outlined"
                helperText={
                  !canChangeFieldType && recordsTotal > 0
                    ? `Cannot change type - table has ${recordsTotal} record${recordsTotal === 1 ? '' : 's'}`
                    : undefined
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: (theme) => {
                      if (!canChangeFieldType) {
                        return theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.02)';
                      }
                      return theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)';
                    },
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
            variant="outlined"
            fullWidth
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="e.g., 0, 'pending', NOW()"
            helperText="PostgreSQL expression (use single quotes for strings)"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
              },
            }}
          />

          {/* Comment */}
          <TextField
            label="Comment (optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what this field is for..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
              },
            }}
          />

          {/* Foreign Key Relationship Info */}
          {foreignKeyRelationship && (
            <Alert
              severity="info"
              icon={<Iconify icon="mdi:link-variant" width={20} />}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.08)'
                    : 'rgba(33, 150, 243, 0.08)',
                border: (theme) =>
                  `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(33, 150, 243, 0.2)'
                    : 'rgba(33, 150, 243, 0.2)'}`,
                borderRadius: '12px',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={600}>
                  Foreign Key Relationship
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>References:</strong> {foreignKeyRelationship.target_table_schema}.
                    {foreignKeyRelationship.target_table_name} ({foreignKeyRelationship.target_column_name})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Constraint:</strong> {foreignKeyRelationship.constraint_name}
                  </Typography>
                </Box>
              </Stack>
            </Alert>
          )}

        </Stack>

        {/* Footer Actions */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            p: 3,
            borderTop: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(18, 18, 18, 0.5)'
                : 'rgba(255, 255, 255, 0.5)',
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
            disabled={!fieldName.trim() || !postgresType || !!fieldNameError || !hasChanges}
          />
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default memo(EditFieldDrawer);
