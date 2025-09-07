import { Stack, TextField, Drawer, Typography, IconButton, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { useCallback, memo, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateFieldThunk } from '../../../redux/slices/bases';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';

// Common field types
const FIELD_TYPES = [
  { value: 'singleLineText', label: 'Single Line Text', dbType: 'TEXT' },
  { value: 'multiLineText', label: 'Multi Line Text', dbType: 'TEXT' },
  { value: 'number', label: 'Number', dbType: 'NUMERIC' },
  { value: 'checkbox', label: 'Checkbox', dbType: 'BOOLEAN' },
  { value: 'singleSelect', label: 'Single Select', dbType: 'TEXT' },
  { value: 'multipleSelect', label: 'Multiple Select', dbType: 'TEXT[]' },
  { value: 'date', label: 'Date', dbType: 'DATE' },
  { value: 'dateTime', label: 'Date & Time', dbType: 'TIMESTAMP' },
  { value: 'email', label: 'Email', dbType: 'TEXT' },
  { value: 'url', label: 'URL', dbType: 'TEXT' },
  { value: 'phone', label: 'Phone', dbType: 'TEXT' },
];

const EditFieldDrawer = ({ baseId, tableId, field, open, onClose }) => {
  const methods = useForm({
    defaultValues: {
      name: '',
      type: 'singleLineText',
      required: false,
      unique: false,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
    setValue,
    watch,
  } = methods;

  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  // Reset form when field changes or dialog opens
  useEffect(() => {
    if (field && open) {
      reset({
        name: field.name || '',
        type: field.type || 'singleLineText',
        required: field.required || false,
        unique: field.unique || false,
      });
    }
  }, [field, open, reset]);

  const onSubmit = useCallback(async (data) => {
    const selectedFieldType = FIELD_TYPES.find(type => type.value === data.type);
    const updateData = {
      name: data.name,
      type: data.type,
      db_field_type: selectedFieldType?.dbType || 'TEXT',
      required: data.required,
      unique: data.unique,
    };

    dispatchWithFeedback(updateFieldThunk(tableId, field.id, updateData), {
      useSnackbar: true,
      successMessage: 'Field updated successfully',
      errorMessage: 'Could not update field',
    }).then(() => onClose());
  }, [tableId, field?.id, onClose, dispatchWithFeedback]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const watchedValues = watch();
  const selectedFieldType = FIELD_TYPES.find(type => type.value === watchedValues.type);
  const isPrimaryField = field?.is_primary;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
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
      <FormProvider {...methods}>
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
          <Stack sx={{ flex: 1, p: 3, gap: 3 }}>
            {/* Field Name */}
            <TextField
              label="Field Name"
              variant="outlined"
              fullWidth
              value={watchedValues.name}
              onChange={(e) => setValue('name', e.target.value, { shouldDirty: true })}
              disabled={isPrimaryField}
              helperText={isPrimaryField ? 'Primary field name cannot be changed' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isPrimaryField ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                },
              }}
            />

            {/* Field Type */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="field-type-label">Field Type</InputLabel>
              <Select
                labelId="field-type-label"
                label="Field Type"
                value={watchedValues.type}
                onChange={(e) => setValue('type', e.target.value, { shouldDirty: true })}
                disabled={isPrimaryField}
                sx={{
                  backgroundColor: isPrimaryField ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                }}
              >
                {FIELD_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {type.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Database: {type.dbType}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Field Options */}
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Field Options
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={watchedValues.required}
                    onChange={(e) => setValue('required', e.target.checked, { shouldDirty: true })}
                    disabled={isPrimaryField}
                  />
                }
                label="Required"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={watchedValues.unique}
                    onChange={(e) => setValue('unique', e.target.checked, { shouldDirty: true })}
                    disabled={isPrimaryField}
                  />
                }
                label="Unique"
              />
            </Stack>

            {/* Field Info */}
            <Stack
              sx={{
                padding: 2,
                backgroundColor: isPrimaryField ? 'rgba(255, 152, 0, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                borderRadius: '12px',
                border: `1px solid ${isPrimaryField ? 'rgba(255, 152, 0, 0.2)' : 'rgba(25, 118, 210, 0.2)'}`,
              }}
            >
              <Typography variant="body2" sx={{ color: isPrimaryField ? 'rgba(255, 152, 0, 0.9)' : 'rgba(25, 118, 210, 0.9)' }}>
                {isPrimaryField ? (
                  <>🔑 This is a primary field and has limited editing options.</>
                ) : (
                  <>💡 Changes to field type may affect existing data. Database type: {selectedFieldType?.dbType}</>
                )}
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
              disabled={isSubmitting}
            />
            <InteractiveButton
              icon="mdi:check"
              title="Save Changes"
              onClick={handleSubmit(onSubmit)}
              duration={8000}
              containerClassName="h-[40px]"
              borderClassName="h-[40px] w-[150px]"
              enableBorder={true}
              loading={isSubmitting}
              disabled={!isDirty}
            />
          </Stack>
        </Stack>
      </FormProvider>
    </Drawer>
  );
};

export default memo(EditFieldDrawer);
