import { Box, Typography, IconButton, Stack, Switch } from '@mui/material';

import DistributionForm from './distribution/DistributionForm';
import DistributionSetup from './distribution/DistributionSetup';
import Iconify from '../../../../../components/iconify/Iconify';
import useFeedbackDispatch from '../../../../../hooks/useFeedbackDispatch';
import { createTemplate, updateTemplate } from '../../../../../redux/slices/general';

const Distribution = ({ altaner }) => {
  const hasTemplate = !!altaner?.template;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const handleCreateTemplate = () => {
    if (!altaner?.id) return;
    dispatchWithFeedback(
      createTemplate({
        id: altaner.id,
        entity_type: 'altaner',
      }),
      {
        useSnackbar: true,
        successMessage: 'Altaner template created successfully.',
        errorMessage: 'Could not create altaner template: ',
      },
    );
  };

  const handleSave = (formData) => {
    if (!altaner?.template?.id) return;
    dispatchWithFeedback(updateTemplate(altaner.template.id, formData), {
      useSnackbar: true,
      successMessage: 'Template updated successfully.',
      errorMessage: 'Could not update template: ',
    });
  };

  return (
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, fontSize: '0.875rem' }}
      >
        Distribution
      </Typography>
      {altaner?.template?.id && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: 'monospace' }}
            >
              Template Id: {altaner.template.id.slice(0, 5)}
            </Typography>

            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(altaner.template.id);
              }}
            >
              <Iconify
                icon="mdi:content-copy"
                width={12}
              />
            </IconButton>
          </Stack>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300'),
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: 'monospace',
                  flex: 1,
                  wordBreak: 'break-all',
                }}
              >
                https://altan.ai/template/{altaner.template.id}
              </Typography>

              <IconButton
                size="small"
                onClick={() => {
                  const shareLink = `https://altan.ai/template/${altaner.template.id}`;
                  navigator.clipboard.writeText(shareLink);
                }}
                sx={{
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'),
                  },
                }}
              >
                <Iconify
                  icon="mdi:content-copy"
                  width={14}
                />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => {
                  const shareLink = `https://altan.ai/template/${altaner.template.id}`;
                  window.open(shareLink, '_blank');
                }}
                sx={{
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'),
                  },
                }}
              >
                <Iconify
                  icon="mdi:open-in-new"
                  width={14}
                />
              </IconButton>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
              mb: 3,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5 }}
                >
                  Template Visibility
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {altaner.template.is_visible
                    ? 'Template is visible in marketplace'
                    : 'Template is hidden from marketplace'}
                </Typography>
              </Box>
              <Switch
                checked={altaner.template.is_visible || false}
                onChange={() => {
                  const updatedTemplate = {
                    ...altaner.template,
                    is_visible: !altaner.template.is_visible,
                  };
                  handleSave(updatedTemplate);
                }}
                sx={{ ml: 2 }}
              />
            </Stack>
          </Box>
        </>
      )}

      {!hasTemplate ? (
        <DistributionSetup
          onCreateTemplate={handleCreateTemplate}
          isSubmitting={isSubmitting}
        />
      ) : (
        <DistributionForm
          template={altaner.template}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default Distribution;
