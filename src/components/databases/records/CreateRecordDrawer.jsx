import {
  Stack,
  Drawer,
  IconButton,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { useState, useCallback, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { createTableRecords, selectTableById, selectFieldsByTableId } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';

const CreateRecordDrawer = ({ baseId, tableId, open, onClose }) => {
  const [formData, setFormData] = useState({});

  const table = useSelector(
    useMemo(
      () => (state) => selectTableById(state, baseId, tableId),
      [baseId, tableId],
    ),
  );

  const fields = useSelector(
    useMemo(
      () => (state) => selectFieldsByTableId(state, baseId, tableId),
      [baseId, tableId],
    ),
  );

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!tableId) return;

    try {
      // Filter out empty values and system fields
      const recordData = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value !== '' && value !== null && value !== undefined &&
            !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(key)) {
          recordData[key] = value;
        }
      });

      if (Object.keys(recordData).length > 0) {
        await dispatch(createTableRecords(tableId, [recordData]));
        handleClose();
      }
    } catch (error) {
      console.error('Error creating record:', error);
    }
  }, [tableId, formData]);

  const handleClose = useCallback(() => {
    setFormData({});
    onClose?.();
  }, [onClose]);

  const renderFieldInput = useCallback((field) => {
    const value = formData[field.db_field_name] ?? '';
    const dataType = field.data_type?.toLowerCase() || 'text';

    // Determine input type based on PostgreSQL data type
    let inputType = 'text';
    let multiline = false;
    let rows = 1;

    if (dataType === 'boolean') {
      return (
        <Box key={field.id} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {field.name}
            {!field.is_nullable && <span style={{ color: 'error.main' }}> *</span>}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleFieldChange(field.db_field_name, true)}
              sx={{
                backgroundColor: value === true ? 'primary.main' : 'transparent',
                color: value === true ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: value === true ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Iconify icon="mdi:check" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleFieldChange(field.db_field_name, false)}
              sx={{
                backgroundColor: value === false ? 'error.main' : 'transparent',
                color: value === false ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: value === false ? 'error.dark' : 'action.hover',
                },
              }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
        </Box>
      );
    }

    if (dataType.includes('int') || dataType === 'numeric' || dataType === 'real' || dataType === 'double precision') {
      inputType = 'number';
    } else if (dataType === 'date') {
      inputType = 'date';
    } else if (dataType === 'time') {
      inputType = 'time';
    } else if (dataType.includes('timestamp')) {
      inputType = 'datetime-local';
    } else if (dataType === 'text' || dataType.includes('json')) {
      multiline = true;
      rows = 3;
    }

    return (
      <TextField
        key={field.id}
        label={field.name}
        value={value}
        onChange={(e) => handleFieldChange(field.db_field_name, e.target.value)}
        fullWidth
        multiline={multiline}
        rows={rows}
        type={inputType}
        required={!field.is_nullable}
        helperText={field.comment || `Type: ${field.data_type}`}
        placeholder={`Enter ${field.name.toLowerCase()}...`}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
          },
        }}
      />
    );
  }, [formData, handleFieldChange]);

  if (!tableId || !baseId) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '90%', md: 500 },
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
          <CardTitle>Create {table?.name || 'Record'}</CardTitle>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mdi:close" width={20} height={20} />
          </IconButton>
        </Stack>

        {/* Content */}
        <Stack sx={{ flex: 1, p: 3, gap: 2, overflow: 'auto' }}>
          {fields
            .filter((field) => !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(field.db_field_name))
            .map((field) => renderFieldInput(field))}

          {fields.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No fields available. Add fields to this table first.
              </Typography>
            </Box>
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
            icon="mdi:check"
            title="Create Record"
            onClick={handleSubmit}
            duration={8000}
            containerClassName="h-[40px]"
            borderClassName="h-[40px] w-[150px]"
            enableBorder={true}
            disabled={Object.keys(formData).length === 0}
          />
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default memo(CreateRecordDrawer);
