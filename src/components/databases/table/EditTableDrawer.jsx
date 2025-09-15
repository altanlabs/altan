import {
  Stack,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useCallback, memo, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateTableById } from '../../../redux/slices/bases';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';
import EditFieldDrawer from '../fields/EditFieldDrawer';

// Available ID field types based on the SystemFieldConfig
const ID_FIELD_TYPES = [
  { value: 'UUID', label: 'UUID' },
  { value: 'BIGSERIAL', label: 'BIGSERIAL' },
  { value: 'SERIAL', label: 'SERIAL' },
  { value: 'INTEGER', label: 'INTEGER' },
  { value: 'BIGINT', label: 'BIGINT' },
];

const EditTableDrawer = ({ baseId, tableId, table, open, onClose }) => {
  const theme = useTheme();
  const methods = useForm({
    defaultValues: {
      name: '',
      id_type: 'UUID',
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
  const [idTypeDrawerOpen, setIdTypeDrawerOpen] = useState(false);
  const [fieldEditDrawerOpen, setFieldEditDrawerOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  // Reset form when table changes or dialog opens
  useEffect(() => {
    if (table && open) {
      reset({
        name: table.name || '',
        id_type: table.system_field_config?.id_type || 'UUID',
      });
    }
  }, [table, open, reset]);

  const onSubmit = useCallback(
    async (data) => {
      const updateData = {
        name: data.name,
        system_field_config: {
          id_type: data.id_type,
        },
      };

      dispatchWithFeedback(updateTableById(baseId, tableId, updateData), {
        useSnackbar: true,
        successMessage: 'Table updated successfully',
        errorMessage: 'Could not update table',
      }).then(() => onClose());
    },
    [baseId, tableId, onClose, dispatchWithFeedback],
  );

  const handleClose = useCallback(() => {
    reset();
    setIdTypeDrawerOpen(false);
    onClose();
  }, [reset, onClose]);

  const handleOpenIdTypeDrawer = useCallback(() => {
    setIdTypeDrawerOpen(true);
  }, []);

  const handleCloseIdTypeDrawer = useCallback(() => {
    setIdTypeDrawerOpen(false);
  }, []);

  const handleSelectIdType = useCallback(
    (idType) => {
      setValue('id_type', idType, { shouldDirty: true });
      setIdTypeDrawerOpen(false);
    },
    [setValue],
  );

  const handleFieldClick = useCallback((field) => {
    setSelectedField(field);
    setFieldEditDrawerOpen(true);
  }, []);

  const handleCloseFieldEditDrawer = useCallback(() => {
    setFieldEditDrawerOpen(false);
    setSelectedField(null);
  }, []);

  const watchedValues = watch();
  const selectedIdType = ID_FIELD_TYPES.find((type) => type.value === watchedValues.id_type);
  const isUsersTable = table?.name?.toLowerCase() === 'users';

  return (
    <>
      {/* Main Edit Table Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <FormProvider {...methods}>
          <Stack sx={{ height: '100%' }}>
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}
            >
              <CardTitle>Edit Table</CardTitle>
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
            <Stack sx={{ flex: 1, p: 3, gap: 3 }}>
              {/* Table Name Field */}
              <TextField
                label="Table Name"
                variant="outlined"
                fullWidth
                value={watchedValues.name}
                onChange={(e) => setValue('name', e.target.value, { shouldDirty: true })}
                disabled={isUsersTable}
                helperText={isUsersTable ? 'Users table name cannot be changed' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isUsersTable
                      ? alpha(theme.palette.action.disabled, 0.08)
                      : alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    '&:hover': {
                      backgroundColor: isUsersTable
                        ? alpha(theme.palette.action.disabled, 0.08)
                        : alpha(theme.palette.background.paper, 0.8),
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                    '&.Mui-focused': {
                      backgroundColor: isUsersTable
                        ? alpha(theme.palette.action.disabled, 0.08)
                        : alpha(theme.palette.background.paper, 0.9),
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />

              {/* ID Field Type Selection */}
              <Stack spacing={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  ID Field Type
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={isUsersTable ? undefined : handleOpenIdTypeDrawer}
                  sx={{
                    padding: 2,
                    backgroundColor: isUsersTable
                      ? alpha(theme.palette.action.disabled, 0.08)
                      : alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    cursor: isUsersTable ? 'not-allowed' : 'pointer',
                    opacity: isUsersTable ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: isUsersTable
                        ? alpha(theme.palette.action.disabled, 0.08)
                        : alpha(theme.palette.background.paper, 0.8),
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                  }}
                >
                  <Stack
                    direction="column"
                    spacing={0.5}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      {selectedIdType?.label || 'UUID'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {watchedValues.id_type === 'UUID' &&
                        'Universally unique identifier (recommended)'}
                      {watchedValues.id_type === 'BIGSERIAL' && 'Auto-incrementing 64-bit integer'}
                      {watchedValues.id_type === 'SERIAL' && 'Auto-incrementing 32-bit integer'}
                      {watchedValues.id_type === 'INTEGER' && 'Manual 32-bit integer'}
                      {watchedValues.id_type === 'BIGINT' && 'Manual 64-bit integer'}
                    </Typography>
                  </Stack>
                  <Iconify
                    icon="mdi:chevron-right"
                    width={24}
                    height={24}
                  />
                </Stack>
              </Stack>

              {/* Info Text */}
              <Stack
                sx={{
                  padding: 2,
                  backgroundColor: isUsersTable
                    ? alpha(theme.palette.warning.main, 0.08)
                    : alpha(theme.palette.info.main, 0.08),
                  borderRadius: '12px',
                  border: `1px solid ${
                    isUsersTable
                      ? alpha(theme.palette.warning.main, 0.2)
                      : alpha(theme.palette.info.main, 0.2)
                  }`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isUsersTable ? theme.palette.warning.main : theme.palette.info.main,
                  }}
                >
                  {isUsersTable ? (
                    <>
                      🔒 The users table is a system table and cannot be modified. This table
                      manages user authentication and core user data.
                    </>
                  ) : (
                    <>
                      💡 Changing the ID field type will affect how new records are created.
                      Existing records will not be modified.
                    </>
                  )}
                </Typography>
              </Stack>

              {/* Fields List */}
              {table?.fields?.items && table.fields.items.length > 0 && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Fields ({table.fields.items.length})
                  </Typography>
                  <List
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      maxHeight: 200,
                      overflow: 'auto',
                      p: 0,
                    }}
                  >
                    {table.fields.items.map((field, index) => (
                      <ListItem
                        key={field.id}
                        disablePadding
                      >
                        <ListItemButton
                          onClick={() => handleFieldClick(field)}
                          disabled={isUsersTable}
                          sx={{
                            borderRadius:
                              index === 0
                                ? '8px 8px 0 0'
                                : index === table.fields.items.length - 1
                                  ? '0 0 8px 8px'
                                  : 0,
                            opacity: isUsersTable ? 0.6 : 1,
                            '&:hover': {
                              backgroundColor: isUsersTable
                                ? 'transparent'
                                : alpha(theme.palette.action.hover, 0.08),
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                >
                                  {field.name}
                                </Typography>
                                {field.is_primary && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                      color: theme.palette.warning.main,
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    PRIMARY
                                  </Typography>
                                )}
                              </Stack>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {field.type} • {field.db_field_type}
                              </Typography>
                            }
                          />
                          {!isUsersTable && (
                            <Iconify
                              icon="mdi:chevron-right"
                              sx={{
                                width: 16,
                                height: 16,
                                color: 'text.secondary',
                              }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              )}
            </Stack>

            {/* Footer Actions */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                p: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
              }}
            >
              {isUsersTable ? (
                <InteractiveButton
                  title="Close"
                  onClick={handleClose}
                  containerClassName="h-[40px]"
                  borderClassName="h-[40px] w-[100px]"
                  enableBorder={true}
                />
              ) : (
                <>
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
                </>
              )}
            </Stack>
          </Stack>
        </FormProvider>
      </Drawer>

      {/* ID Type Selection Drawer */}
      <Drawer
        anchor="bottom"
        open={idTypeDrawerOpen}
        onClose={handleCloseIdTypeDrawer}
        PaperProps={{
          sx: {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            maxHeight: '70vh',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderBottom: 'none',
          },
        }}
      >
        <Stack
          spacing={2}
          sx={{ p: 3 }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Select ID Field Type
            </Typography>
            <IconButton
              onClick={handleCloseIdTypeDrawer}
              size="small"
            >
              <Iconify
                icon="mdi:close"
                width={20}
                height={20}
              />
            </IconButton>
          </Stack>

          <Divider />

          {/* Options List */}
          <List sx={{ p: 0 }}>
            {ID_FIELD_TYPES.map((type) => (
              <ListItem
                key={type.value}
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleSelectIdType(type.value)}
                  selected={watchedValues.id_type === type.value}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    backgroundColor:
                      watchedValues.id_type === type.value
                        ? alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                    '&:hover': {
                      backgroundColor:
                        watchedValues.id_type === type.value
                          ? alpha(theme.palette.primary.main, 0.12)
                          : alpha(theme.palette.action.hover, 0.08),
                    },
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={600}
                        >
                          {type.label}
                        </Typography>
                        {type.value === 'UUID' && (
                          <Typography
                            variant="caption"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              px: 1,
                              py: 0.25,
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          >
                            RECOMMENDED
                          </Typography>
                        )}
                        {watchedValues.id_type === type.value && (
                          <Iconify
                            icon="mdi:check"
                            width={20}
                            height={20}
                            sx={{ color: 'primary.main', ml: 'auto' }}
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {type.value === 'UUID' && 'Universally unique identifier (recommended)'}
                        {type.value === 'BIGSERIAL' && 'Auto-incrementing 64-bit integer'}
                        {type.value === 'SERIAL' && 'Auto-incrementing 32-bit integer'}
                        {type.value === 'INTEGER' && 'Manual 32-bit integer'}
                        {type.value === 'BIGINT' && 'Manual 64-bit integer'}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Drawer>

      {/* Edit Field Drawer - Stacked */}
      {selectedField && (
        <EditFieldDrawer
          baseId={baseId}
          tableId={tableId}
          field={selectedField}
          open={fieldEditDrawerOpen}
          onClose={handleCloseFieldEditDrawer}
        />
      )}
    </>
  );
};

export default memo(EditTableDrawer);
