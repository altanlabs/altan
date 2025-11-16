// @mui
import { Tooltip, Stack, Typography, Box, Button } from '@mui/material';

// auth
import { useAuthContext } from '../../auth/useAuthContext.ts';
// layouts
import AnimatedVideoLayout from '../../layouts/login';

// ----------------------------------------------------------------------

export default function LoginAuth0() {
  const { method } = useAuthContext();

  // NOTE: Turn off comments below to enable Auth0.
  // const { login } = useAuthContext();

  const handleLoginAuth0 = async () => {
    try {
      // NOTE: Turn off comments below to enable Auth0.
      // await login();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AnimatedVideoLayout>
      <Stack
        spacing={2}
        sx={{ mb: 5, position: 'relative' }}
      >
        <Typography variant="h4">Sign in to optimai</Typography>

        <Tooltip
          title={method}
          placement="left"
        >
          <Box
            component="img"
            alt={method}
            src={`/assets/icons/auth/ic_${method}.png`}
            sx={{ width: 32, height: 32, position: 'absolute', right: 0 }}
          />
        </Tooltip>
      </Stack>

      <Button
        fullWidth
        color="inherit"
        size="large"
        variant="contained"
        onClick={handleLoginAuth0}
        sx={{
          bgcolor: 'text.primary',
          color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          '&:hover': {
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          },
        }}
      >
        Login
      </Button>
    </AnimatedVideoLayout>
  );
}
