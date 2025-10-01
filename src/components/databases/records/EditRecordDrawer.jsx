import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
  Tooltip,
  TextField,
} from '@mui/material';
import { useState, useCallback, memo, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { updateTableRecordThunk } from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import Iconify from '../../iconify';
import CreateFieldDrawer from '../fields/CreateFieldDrawer';

const EditRecordDrawer = ({ baseId, tableId, recordId, open, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);

  const table = useSelector(
    useMemo(
      () => (state) =>
        state.bases?.bases?.[baseId]?.tables?.items?.find((t) => t?.id === tableId) ?? null,
      [baseId, tableId],
    ),
  );

  const fields = useMemo(() => table?.fields?.items ?? [], [table]);
  const record = useSelector(
    useMemo(
      () => (state) =>
        state.bases?.records?.[tableId]?.items?.find((r) => r?.id === recordId) ?? null,
      [tableId, recordId],
    ),
  );

  // Initialize form data from record
  useEffect(() => {
    if (record && open) {
      setFormData(record);
      setIsDirty(false);
    }
  }, [record, open]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!tableId || !recordId || !isDirty) return;

    try {
      // Only send changed fields
      const changes = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== record[key] && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes[key] = formData[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        await dispatch(updateTableRecordThunk(tableId, recordId, changes));
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  }, [tableId, recordId, formData, record, isDirty]);

  const handleShare = useCallback(() => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).catch(() => {});
  }, []);

  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    setFormData({});
    setIsDirty(false);
    onClose?.();
  }, [isDirty, onClose]);

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

  if (!tableId || !recordId || !baseId || recordId == null) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '90%', md: 600 },
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
          <CardTitle>{record?.name || table?.name || 'Edit Record'}</CardTitle>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy record URL">
              <IconButton onClick={handleShare} size="small">
                <Iconify icon="mdi:share" width={20} height={20} />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose} size="small">
              <Iconify icon="mdi:close" width={20} height={20} />
            </IconButton>
          </Box>
        </Stack>

        {/* Content */}
        <Stack sx={{ flex: 1, p: 3, gap: 2, overflow: 'auto' }}>
          {fields
            .filter((field) => !['id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(field.db_field_name))
            .map((field) => renderFieldInput(field))}

          <Divider sx={{ my: 2 }} />

          <Box
            onClick={() => setIsCreateFieldOpen(true)}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              + Add new field to this table
            </Typography>
          </Box>
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
          <LoadingButton
            variant="contained"
            startIcon={<Iconify icon="mdi:check" />}
            onClick={handleSubmit}
            disabled={!isDirty}
            fullWidth
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </Stack>

      {table && (
        <CreateFieldDrawer table={table} open={isCreateFieldOpen} onClose={() => setIsCreateFieldOpen(false)} />
      )}
    </Drawer>
  );
};

export default memo(EditRecordDrawer);
