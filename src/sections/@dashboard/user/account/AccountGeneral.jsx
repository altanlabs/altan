import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import React, { useState, memo, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import FormProvider, { RHFTextField, RHFUploadAvatar } from '../../../../components/hook-form';
import Iconify from '../../../../components/iconify';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import { selectAccount, updateAccountCompany } from '../../../../redux/slices/general';
import { uploadMedia } from '../../../../utils/media';

function AccountSettings() {
  const theme = useTheme();
  const account = useSelector(selectAccount);
  const [avatarSrc, setAvatarSrc] = useState(account?.logo_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const schema = Yup.object().shape({
    name: Yup.string().required('Workspace name is required'),
    logo_url: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: account?.name || '',
      logo_url: account?.logo_url || null,
    }),
    [account?.name, account?.logo_url],
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, setValue } = methods;

  const onSubmit = async (data) => {
    console.log('submitting');

    const updateData = {
      name: data.name,
    };

    if (avatarFile) {
      try {
        const mediaId = await uploadMedia(avatarFile);
        updateData.logo_url = mediaId;
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    }
    console.log('submitting');
    dispatchWithFeedback(updateAccountCompany(updateData), {
      successMessage: 'Settings updated successfully',
      errorMessage: 'Failed to update settings',
      useSnackbar: true,
    });
  };

  const handleDropSingleFile = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue('logo_url', newFile, { shouldValidate: true });
        setAvatarFile(file);
        setAvatarSrc(newFile.preview);
      }
    },
    [setValue],
  );

  const handleCopyWorkspaceId = useCallback(() => {
    navigator.clipboard.writeText(account?.id || '');
  }, [account?.id]);

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider methods={methods}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your workspace settings and preferences.
                </p>
              </div>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                startIcon={
                  <Iconify
                    icon="eva:checkmark-circle-2-outline"
                    width={18}
                  />
                }
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '10px 20px',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)'
                      : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                Save Changes
              </LoadingButton>
            </div>
            <div className="space-y-6">
              {/* Workspace Section */}
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-lg font-medium text-card-foreground">Workspace</h2>
                </div>

                <div className="px-6 py-6 space-y-6">
                  {/* Workspace ID */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Workspace/Account ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={account?.id}
                        readOnly
                        className="w-full px-3 py-2 pr-10 text-sm font-mono text-muted-foreground bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleCopyWorkspaceId}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Iconify
                          icon="eva:copy-outline"
                          width={16}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Workspace Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Workspace Name
                    </label>
                    <div className="relative">
                      <RHFTextField
                        name="name"
                        placeholder="Enter workspace name"
                        size="small"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            '& fieldset': {
                              borderColor: theme.palette.divider,
                            },
                            '&:hover fieldset': {
                              borderColor: theme.palette.action.hover,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                              borderWidth: '2px',
                            },
                          },
                          '& .MuiInputBase-input': {
                            padding: '8px 12px',
                            color: theme.palette.text.primary,
                            '&::placeholder': {
                              color: theme.palette.text.secondary,
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Section */}
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-lg font-medium text-card-foreground">Logo</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be displayed in your workspace and shared content.
                  </p>
                </div>

                <div className="px-6 py-6">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <RHFUploadAvatar
                        name="logo_url"
                        file={avatarSrc}
                        maxSize={3145728}
                        onDrop={handleDropSingleFile}
                        onDelete={() => {
                          setValue('logo_url', null);
                          setAvatarSrc(null);
                          setAvatarFile(null);
                        }}
                        sx={{
                          '& .MuiAvatar-root': {
                            backgroundColor: theme.palette.background.default,
                            border: `2px dashed ${theme.palette.divider}`,
                          },
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground mb-1">
                        Click to upload or drag and drop
                      </div>
                      <div className="text-xs text-muted-foreground opacity-70">
                        SVG, PNG, JPG or GIF (max. 3MB)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormProvider>
      </form>
    </div>
  );
}

export default memo(AccountSettings);
