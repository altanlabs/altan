// form
import { LoadingButton } from '@mui/lab';
import { Card, Stack, Typography, Button, Alert, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
// @mui

// components
import FormProvider, { RHFSwitch } from '../../../../components/hook-form';
import { useSnackbar } from '../../../../components/snackbar';
import Iconify from '../../../../components/iconify';
import {
  isBrowserNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  areBrowserNotificationsEnabled,
  setBrowserNotificationsEnabled,
} from '../../../../utils/browserNotifications';

// ----------------------------------------------------------------------

const ACTIVITY_OPTIONS = [
  {
    value: 'activityComments',
    label: 'Email me when someone comments onmy article',
  },
  {
    value: 'activityAnswers',
    label: 'Email me when someone answers on my form',
  },
  { value: 'activityFollows', label: 'Email me hen someone follows me' },
];

const APPLICATION_OPTIONS = [
  { value: 'applicationNews', label: 'News and announcements' },
  { value: 'applicationProduct', label: 'Weekly product updates' },
  { value: 'applicationBlog', label: 'Weekly blog digest' },
];

const NOTIFICATION_SETTINGS = {
  activityComments: true,
  activityAnswers: true,
  activityFollows: false,
  applicationNews: true,
  applicationProduct: false,
  applicationBlog: false,
  browserNotifications: false,
};

// ----------------------------------------------------------------------

export default function AccountNotifications() {
  const { enqueueSnackbar } = useSnackbar();
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState(
    getNotificationPermission()
  );
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const defaultValues = {
    activityComments: NOTIFICATION_SETTINGS.activityComments,
    activityAnswers: NOTIFICATION_SETTINGS.activityAnswers,
    activityFollows: NOTIFICATION_SETTINGS.activityFollows,
    applicationNews: NOTIFICATION_SETTINGS.applicationNews,
    applicationProduct: NOTIFICATION_SETTINGS.applicationProduct,
    applicationBlog: NOTIFICATION_SETTINGS.applicationBlog,
    browserNotifications: areBrowserNotificationsEnabled(),
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const browserNotificationsEnabled = watch('browserNotifications');

  // Update browser notification preference when changed
  useEffect(() => {
    setBrowserNotificationsEnabled(browserNotificationsEnabled);
  }, [browserNotificationsEnabled]);

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const permission = await requestNotificationPermission();
      setBrowserNotificationPermission(permission);
      if (permission === 'granted') {
        enqueueSnackbar('Browser notifications enabled!', { variant: 'success' });
      } else if (permission === 'denied') {
        enqueueSnackbar(
          'Browser notifications blocked. Please enable them in your browser settings.',
          { variant: 'warning' }
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      enqueueSnackbar('Failed to request notification permission', { variant: 'error' });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Save browser notification preference
      setBrowserNotificationsEnabled(data.browserNotifications);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar('Notification preferences saved!', { variant: 'success' });
      console.log('DATA', data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save preferences', { variant: 'error' });
    }
  };

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card sx={{ p: 3 }}>
        {/* Browser Notifications Section */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Iconify
              icon="solar:bell-bing-bold-duotone"
              width={24}
              sx={{ color: 'primary.main' }}
            />
            <Typography
              variant="overline"
              component="div"
              sx={{ color: 'text.secondary' }}
            >
              Browser Notifications
            </Typography>
          </Stack>

          {!isBrowserNotificationSupported() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Browser notifications are not supported in your current browser.
            </Alert>
          )}

          {isBrowserNotificationSupported() && browserNotificationPermission === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You have blocked browser notifications. To enable them, please update your browser
              settings and reload the page.
            </Alert>
          )}

          {isBrowserNotificationSupported() && browserNotificationPermission === 'default' && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRequestPermission}
                  disabled={isRequestingPermission}
                >
                  {isRequestingPermission ? 'Requesting...' : 'Enable'}
                </Button>
              }
            >
              Enable browser notifications to receive real-time alerts about mentions, assignments,
              and important updates.
            </Alert>
          )}

          <Stack
            alignItems="flex-start"
            spacing={1}
          >
            <RHFSwitch
              name="browserNotifications"
              label="Enable browser notifications"
              disabled={
                !isBrowserNotificationSupported() ||
                browserNotificationPermission === 'denied' ||
                browserNotificationPermission === 'default'
              }
              sx={{ m: 0 }}
            />
          </Stack>

          {browserNotificationPermission === 'granted' && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1, ml: 4 }}
            >
              You'll receive desktop notifications for mentions, assignments, and important updates
              when you're not actively using the app.
            </Typography>
          )}
        </Box>

        <Typography
          variant="overline"
          component="div"
          sx={{ color: 'text.secondary' }}
        >
          Activity
        </Typography>

        <Stack
          alignItems="flex-start"
          spacing={1}
          sx={{ mt: 2 }}
        >
          {ACTIVITY_OPTIONS.map((activity) => (
            <RHFSwitch
              key={activity.value}
              name={activity.value}
              label={activity.label}
              sx={{ m: 0 }}
            />
          ))}
        </Stack>

        <Typography
          variant="overline"
          component="div"
          sx={{ color: 'text.secondary', mt: 5 }}
        >
          Application
        </Typography>

        <Stack
          alignItems="flex-start"
          spacing={1}
          sx={{ mt: 2, mb: 5 }}
        >
          {APPLICATION_OPTIONS.map((application) => (
            <RHFSwitch
              key={application.value}
              name={application.value}
              label={application.label}
              sx={{ m: 0 }}
            />
          ))}
        </Stack>

        <Stack>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ ml: 'auto' }}
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
