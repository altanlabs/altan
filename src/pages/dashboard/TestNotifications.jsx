import { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import { addNotification } from '../../redux/slices/notifications';
import {
  sendBrowserNotification,
  getNotificationPermission,
  requestNotificationPermission,
  isBrowserNotificationSupported,
  areBrowserNotificationsEnabled,
} from '../../utils/browserNotifications';

export default function TestNotifications() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  const [title, setTitle] = useState('Test Notification');
  const [body, setBody] = useState('This is a test notification from Altan!');
  const [category, setCategory] = useState('system');
  const [addToRedux, setAddToRedux] = useState(true);
  const [testMode, setTestMode] = useState(false); // For testing without switching tabs
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  const permission = getNotificationPermission();
  const isSupported = isBrowserNotificationSupported();
  const isEnabled = areBrowserNotificationsEnabled();

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      enqueueSnackbar('Permission granted!', { variant: 'success' });
    } else {
      enqueueSnackbar('Permission denied', { variant: 'error' });
    }
  };

  const handleSendDirectNotification = () => {
    if (permission !== 'granted') {
      enqueueSnackbar('Please grant notification permission first', { variant: 'warning' });
      return;
    }

    // Start countdown
    setIsSending(true);
    setCountdown(5);
    enqueueSnackbar('Notification will send in 5 seconds... Switch tabs now! 🚀', {
      variant: 'info',
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Send notification after 5 seconds
    setTimeout(() => {
      sendBrowserNotification(title, {
        body,
        icon: '/logos/logoBlack.png',
        onlyWhenInactive: !testMode, // Allow forcing notification in test mode
        onClick: () => {
          console.log('Notification clicked!');
          window.focus();
        },
      });

      setIsSending(false);
      setCountdown(0);

      if (testMode) {
        enqueueSnackbar('Notification sent! (Test mode)', { variant: 'success' });
      } else {
        enqueueSnackbar('Notification sent! Did you see it? 👀', { variant: 'success' });
      }
    }, 5000);
  };

  const handleSendReduxNotification = () => {
    // Start countdown
    setIsSending(true);
    setCountdown(5);
    enqueueSnackbar('Notification will send in 5 seconds... Switch tabs now! 🚀', {
      variant: 'info',
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Send notification after 5 seconds
    setTimeout(() => {
      const notificationData = {
        id: `test-${Date.now()}`,
        status: 'unopened',
        notification: {
          type: category === 'system' ? 'system' : 'user',
          title,
          body,
          message: body,
          date_creation: new Date().toISOString(),
          meta_data: {
            data: {
              category,
            },
            avatar_url: '/logos/logoBlack.png',
          },
        },
      };

      dispatch(addNotification(notificationData));
      setIsSending(false);
      setCountdown(0);
      enqueueSnackbar('Notification sent! Check your notification center and OS notifications! 🔔', {
        variant: 'success',
      });
    }, 5000);
  };

  const handleSendTaskCompletion = () => {
    // Start countdown
    setIsSending(true);
    setCountdown(5);
    enqueueSnackbar('Task completion notification in 5 seconds... Switch tabs now! 🚀', {
      variant: 'info',
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Send notification after 5 seconds
    setTimeout(() => {
      const taskNotification = {
        id: `task-completed-test-${Date.now()}`,
        status: 'unopened',
        notification: {
          type: 'system',
          title: 'Task Completed',
          body: `✅ "${title}" has been completed!`,
          message: `The task "${title}" has been marked as completed.`,
          date_creation: new Date().toISOString(),
          meta_data: {
            data: {
              category: 'task_completed',
              task: {
                id: 'test-task-id',
                name: title,
                room_id: 'test-room',
              },
            },
            avatar_url: '/logos/logoBlack.png',
          },
        },
      };

      dispatch(addNotification(taskNotification));
      setIsSending(false);
      setCountdown(0);
      enqueueSnackbar('Task completion notification sent! ✅', { variant: 'success' });
    }, 5000);
  };

  const handleSendMention = () => {
    // Start countdown
    setIsSending(true);
    setCountdown(5);
    enqueueSnackbar('Mention notification in 5 seconds... Switch tabs now! 🚀', {
      variant: 'info',
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Send notification after 5 seconds
    setTimeout(() => {
      const mentionNotification = {
        id: `mention-test-${Date.now()}`,
        status: 'unopened',
        notification: {
          type: 'user',
          title: 'New Mention',
          body: `💬 Someone mentioned you: "${body}"`,
          message: body,
          date_creation: new Date().toISOString(),
          meta_data: {
            data: {
              category: 'Mentioned',
              thread: {
                id: 'test-thread',
                room_id: 'test-room',
                name: 'Test Thread',
              },
            },
            member: {
              user: {
                person: {
                  name: 'Test User',
                  avatar_url: '/logos/logoBlack.png',
                },
              },
            },
          },
        },
      };

      dispatch(addNotification(mentionNotification));
      setIsSending(false);
      setCountdown(0);
      enqueueSnackbar('Mention notification sent! 💬', { variant: 'success' });
    }, 5000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h3" gutterBottom>
            🔔 Test Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test browser notifications and see how they work in different scenarios
          </Typography>
        </Box>

        {/* Permission Status */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:shield-check-bold" width={24} />
                <Typography variant="h6">Permission Status</Typography>
              </Stack>

              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Browser Support:
                  </Typography>
                  <Chip
                    label={isSupported ? 'Supported' : 'Not Supported'}
                    color={isSupported ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Permission:
                  </Typography>
                  <Chip
                    label={permission}
                    color={
                      permission === 'granted'
                        ? 'success'
                        : permission === 'denied'
                        ? 'error'
                        : 'warning'
                    }
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Enabled in Settings:
                  </Typography>
                  <Chip
                    label={isEnabled ? 'Enabled' : 'Disabled'}
                    color={isEnabled ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Stack>

              {permission !== 'granted' && (
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:bell-bing-bold" />}
                  onClick={handleRequestPermission}
                  fullWidth
                >
                  Request Permission
                </Button>
              )}

              {permission === 'denied' && (
                <Alert severity="warning">
                  Notifications are blocked. Please enable them in your browser settings and reload
                  the page.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Test Form */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:settings-bold" width={24} />
                <Typography variant="h6">Notification Settings</Typography>
              </Stack>

              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />

              <TextField
                label="Body/Message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="Mentioned">Mention</MenuItem>
                  <MenuItem value="Assigned">Assignment</MenuItem>
                  <MenuItem value="Comment">Comment</MenuItem>
                  <MenuItem value="Invitation">Invitation</MenuItem>
                  <MenuItem value="task_completed">Task Completed</MenuItem>
                </Select>
              </FormControl>

              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addToRedux}
                      onChange={(e) => setAddToRedux(e.target.checked)}
                    />
                  }
                  label="Add to Redux (shows in notification center)"
                />

                <FormControlLabel
                  control={
                    <Switch checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
                  }
                  label="🧪 Test Mode (force show notification even when active)"
                />
                {testMode && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Test mode bypasses the "only when inactive" rule. Notifications will appear
                    immediately even while viewing this page.
                  </Alert>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:rocket-bold" width={24} />
                <Typography variant="h6">Send Test Notifications</Typography>
              </Stack>

              <Divider />

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  isSending ? (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" color="inherit">
                        {countdown}
                      </Typography>
                    </Box>
                  ) : (
                    <Iconify icon="solar:bell-bing-bold-duotone" />
                  )
                }
                onClick={addToRedux ? handleSendReduxNotification : handleSendDirectNotification}
                disabled={permission !== 'granted' || isSending}
                fullWidth
              >
                {isSending ? `Sending in ${countdown}... Switch tabs now!` : 'Send Custom Notification'}
              </Button>

              <Typography variant="caption" color="text.secondary" align="center">
                Quick test presets:
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={handleSendTaskCompletion}
                  disabled={permission !== 'granted' || isSending}
                  sx={{ flex: 1, minWidth: 200 }}
                >
                  Task Completed
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:chat-round-line-bold" />}
                  onClick={handleSendMention}
                  disabled={permission !== 'granted' || isSending}
                  sx={{ flex: 1, minWidth: 200 }}
                >
                  Mention
                </Button>
              </Stack>

              <Stack spacing={2}>
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                  <Typography variant="body2">
                    <strong>Important:</strong> Browser notifications only appear when you're{' '}
                    <strong>NOT</strong> actively viewing this page (unless Test Mode is enabled).
                    After clicking send, switch to another tab/window to see the notification pop up
                    from your operating system!
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => {
                    console.log('🔔 Testing basic notification API...');
                    console.log('Permission:', Notification.permission);
                    console.log('Document visibility:', document.visibilityState);
                    
                    try {
                      const n = new Notification('🧪 Direct Test', {
                        body: 'If you see this, notifications work!',
                        icon: '/logos/logoBlack.png',
                        requireInteraction: false,
                      });
                      console.log('✅ Notification created:', n);
                      enqueueSnackbar('Direct notification sent! (bypassing all checks)', {
                        variant: 'success',
                      });
                      
                      n.onclick = () => {
                        console.log('Notification clicked!');
                        window.focus();
                      };
                      
                      n.onerror = (e) => {
                        console.error('Notification error:', e);
                        enqueueSnackbar('Notification error - check console', { variant: 'error' });
                      };
                    } catch (error) {
                      console.error('❌ Failed to create notification:', error);
                      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
                    }
                  }}
                  fullWidth
                  startIcon={<Iconify icon="solar:bug-bold" />}
                >
                  🧪 Test Raw Notification API (No Delays, Shows Immediately)
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:document-text-bold" width={24} />
                <Typography variant="h6">How to Test</Typography>
              </Stack>

              <Stack spacing={1} component="ol" sx={{ pl: 2 }}>
                <Typography variant="body2" component="li">
                  Make sure notification permission is <strong>granted</strong> (green chip above)
                </Typography>
                <Typography variant="body2" component="li">
                  Fill in the title and body text (or use defaults)
                </Typography>
                <Typography variant="body2" component="li">
                  <strong>Option A:</strong> Enable "Test Mode" toggle to see notifications
                  immediately
                </Typography>
                <Typography variant="body2" component="li">
                  <strong>Option B:</strong> Keep Test Mode off, click send, then{' '}
                  <strong>switch to another tab/window</strong> to see the OS notification
                </Typography>
                <Typography variant="body2" component="li">
                  Click the notification to be brought back to the app
                </Typography>
                <Typography variant="body2" component="li">
                  Check your notification center (bell icon) to see in-app notifications
                </Typography>
              </Stack>

              <Divider />

              <Typography variant="body2" color="text.secondary">
                <strong>Redux Mode:</strong> When enabled, notifications are added to your
                notification center (bell icon) and trigger browser notifications automatically.
                This simulates how real notifications work in the app.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Direct Mode:</strong> When Redux mode is disabled, notifications are sent
                directly to the browser without appearing in the notification center. Useful for
                testing the browser notification API directly.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

