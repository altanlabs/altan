import {
  Stack,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useCallback, memo, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateTableById, fetchTablePolicies } from '../../../redux/slices/bases';
import { dispatch as reduxDispatch } from '../../../redux/store';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import Iconify from '../../iconify';
import EditFieldDrawer from '../fields/EditFieldDrawer';

// Note: ID field types are now managed directly in PostgreSQL via pg-meta
// This component only handles table name and provides access to field editing

const EditTableDrawer = ({ baseId, tableId, table, open, onClose }) => {
  const theme = useTheme();
  const methods = useForm({
    defaultValues: {
      name: '',
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
  const [fieldEditDrawerOpen, setFieldEditDrawerOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [rlsEnabled, setRlsEnabled] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Reset form when table changes or dialog opens
  useEffect(() => {
    if (table && open) {
      reset({
        name: table.name || '',
      });
      setRlsEnabled(table.rls_enabled ?? false);
    }
  }, [table, open, reset]);

  // Fetch policies when drawer opens or when RLS is enabled
  useEffect(() => {
    if (open && table && baseId && (table.rls_enabled || rlsEnabled)) {
      setLoadingPolicies(true);
      console.log('📋 Fetching policies for table:', {
        baseId,
        tableId: table.id,
        tableName: table.name || table.db_name,
        schema: table.schema,
      });

      reduxDispatch(
        fetchTablePolicies(
          baseId,
          table.id,
          table.name || table.db_name,
          table.schema,
        ),
      )
        .then((fetchedPolicies) => {
          setPolicies(fetchedPolicies || []);
          console.log('✅ Policies set in state:', fetchedPolicies);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch policies:', error);
          setPolicies([]);
        })
        .finally(() => {
          setLoadingPolicies(false);
        });
    }
  }, [open, table, baseId, rlsEnabled]);

  const onSubmit = useCallback(
    async (data) => {
      if (!table) return;
      
      const updateData = {
        name: data.name,
        comment: table.comment || null,
        rls_enabled: rlsEnabled,
      };

      dispatchWithFeedback(updateTableById(baseId, tableId, updateData), {
        useSnackbar: true,
        successMessage: 'Table updated successfully',
        errorMessage: 'Could not update table',
      }).then(() => onClose());
    },
    [baseId, tableId, table, onClose, dispatchWithFeedback, rlsEnabled],
  );

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFieldClick = useCallback((field) => {
    setSelectedField(field);
    setFieldEditDrawerOpen(true);
  }, []);

  const handleCloseFieldEditDrawer = useCallback(() => {
    setFieldEditDrawerOpen(false);
    setSelectedField(null);
  }, []);

  const watchedValues = watch();
  const isUsersTable = table?.name?.toLowerCase() === 'users';

  // Don't render if table is not provided
  if (!table && open) {
    return null;
  }

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
            <Stack sx={{ flex: 1, p: 3, gap: 3, overflow: 'auto' }}>
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
                      💡 Click on any field to edit its configuration. Field types and constraints
                      are managed directly in PostgreSQL.
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

              {/* RLS Settings Section */}
              <Stack spacing={2}>
                <Divider />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Row Level Security (RLS)
                  </Typography>
                  {loadingPolicies && (
                    <CircularProgress size={16} thickness={4} />
                  )}
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rlsEnabled}
                      onChange={(e) => setRlsEnabled(e.target.checked)}
                      disabled={isUsersTable}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Enable RLS</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Restrict row access based on policies
                      </Typography>
                    </Box>
                  }
                />
                {rlsEnabled && (
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.08),
                        borderRadius: '12px',
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="caption" color="info.main" fontWeight={600}>
                          💡 {policies.length} {policies.length === 1 ? 'policy' : 'policies'} configured - Click to view details
                        </Typography>
                        {policies.length > 0 && (
                          <Box>
                            {policies.map((policy) => (
                              <Chip
                                key={policy.id}
                                label={policy.name || `Policy ${policy.id}`}
                                size="small"
                                onClick={() => setSelectedPolicy(selectedPolicy?.id === policy.id ? null : policy)}
                                sx={{
                                  mr: 0.5,
                                  mb: 0.5,
                                  cursor: 'pointer',
                                  backgroundColor: selectedPolicy?.id === policy.id
                                    ? alpha(theme.palette.primary.main, 0.2)
                                    : alpha(theme.palette.info.main, 0.15),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.25),
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* Selected Policy Details */}
                    {selectedPolicy && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          borderRadius: '12px',
                          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={600}>
                              {selectedPolicy.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => setSelectedPolicy(null)}
                            >
                              <Iconify icon="mdi:close" width={14} height={14} />
                            </IconButton>
                          </Stack>
                          
                          <Stack spacing={1}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Command
                              </Typography>
                              <Chip
                                label={selectedPolicy.command}
                                size="small"
                                color={
                                  selectedPolicy.command === 'SELECT' ? 'success' :
                                  selectedPolicy.command === 'INSERT' ? 'primary' :
                                  selectedPolicy.command === 'UPDATE' ? 'warning' :
                                  selectedPolicy.command === 'DELETE' ? 'error' : 'default'
                                }
                                sx={{ ml: 1, height: 20, fontSize: '11px' }}
                              />
                            </Box>

                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Type
                              </Typography>
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                {selectedPolicy.action}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Roles
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {selectedPolicy.roles?.map((role, idx) => (
                                  <Chip
                                    key={idx}
                                    label={role}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5, height: 18, fontSize: '10px' }}
                                  />
                                ))}
                              </Box>
                            </Box>

                            {selectedPolicy.definition && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  USING Expression
                                </Typography>
                                <Box
                                  sx={{
                                    mt: 0.5,
                                    p: 1,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                    {selectedPolicy.definition}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {selectedPolicy.check && selectedPolicy.check !== 'true' && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  WITH CHECK Expression
                                </Typography>
                                <Box
                                  sx={{
                                    mt: 0.5,
                                    p: 1,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                    {selectedPolicy.check}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      💡 Policies are managed via PostgreSQL. Use SQL or pg-meta API to create/edit.
                    </Typography>
                  </Stack>
                )}
              </Stack>
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
