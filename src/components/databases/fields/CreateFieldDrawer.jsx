import {
  Stack,
  TextField,
  Drawer,
  Typography,
  IconButton,
  Autocomplete,
  Box,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { useCallback, memo, useState } from 'react';

import { POSTGRES_TYPES } from './utils/postgresTypes';
import { RESERVED_WORDS } from './utils/reservedWords';
import { createField } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store.js';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';

const CreateFieldDrawer = ({ table, open, onClose }) => {
  const [fieldName, setFieldName] = useState('');
  const [postgresType, setPostgresType] = useState(null);
  const [isNullable, setIsNullable] = useState(true);
  const [isUnique, setIsUnique] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [comment, setComment] = useState('');
  const [fieldNameError, setFieldNameError] = useState('');

  const validateFieldName = (name) => {
    if (!name.trim()) {
      return 'Field name is required';
    }
    if (RESERVED_WORDS.has(name.toLowerCase())) {
      return 'This name is reserved and cannot be used';
    }
    // Check for PostgreSQL naming rules
    if (!/^[a-z_][a-z0-9_]*$/.test(name.toLowerCase())) {
      return 'Field name must start with a letter or underscore and contain only letters, numbers, and underscores';
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
    if (!fieldName.trim() || !postgresType || fieldNameError || !table) return;

    try {
      const fieldData = {
        name: fieldName.trim().toLowerCase(), // PostgreSQL convention: lowercase
        db_field_name: fieldName.trim().toLowerCase(),
        type: postgresType.type,
        is_nullable: isNullable,
        is_unique: isUnique,
        comment: comment || null,
      };

      // Only add default_value if provided
      if (defaultValue) {
        fieldData.default_value = defaultValue;
      }

      await dispatch(createField(table, fieldData));
      handleClose();
    } catch (error) {
      // Error will be handled by Redux
      // eslint-disable-next-line no-console
      console.error('Error creating field:', error);
    }
  }, [fieldName, postgresType, isNullable, isUnique, defaultValue, comment, fieldNameError, table, handleClose]);

  const handleFieldNameChange = (e) => {
    const newName = e.target.value;
    setFieldName(newName);
    setFieldNameError(validateFieldName(newName));
  };

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
        },
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
          <CardTitle>Create Field</CardTitle>
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
            helperText={fieldNameError || 'Will be converted to lowercase (PostgreSQL convention)'}
            placeholder="e.g., email, first_name, age"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
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
            groupBy={(option) => option.category}
            renderInput={(params) => (
              <TextField
                {...params}
                label="PostgreSQL Type"
                variant="outlined"
                placeholder="Select a type..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
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
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
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
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
              },
            }}
          />

          {/* Info Box */}
          <Stack
            sx={{
              padding: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
              borderRadius: '12px',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)'}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.9)' : 'rgba(25, 118, 210, 0.9)',
              }}
            >
              💡 Creating a field with native PostgreSQL types gives you full control and better performance.
            </Typography>
          </Stack>
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
              theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.5)' : 'rgba(255, 255, 255, 0.5)',
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
            icon="mdi:plus"
            title="Create Field"
            onClick={handleSubmit}
            duration={8000}
            containerClassName="h-[40px]"
            borderClassName="h-[40px] w-[150px]"
            enableBorder={true}
            disabled={!fieldName.trim() || !postgresType || !!fieldNameError}
          />
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default memo(CreateFieldDrawer);
