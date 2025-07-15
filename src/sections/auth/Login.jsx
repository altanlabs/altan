// @mui
import { Container, Stack, Typography, Link, Dialog, DialogContent, IconButton, Box } from '@mui/material';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

// auth
// routes
// layouts
//
import AuthLoginForm from './AuthLoginForm';
import AuthWithSocial from './AuthWithSocial';
import Iconify from '../../components/iconify';
import Logo from '../../components/logo/Logo';
import { PATH_AUTH } from '../../routes/paths';

// ----------------------------------------------------------------------

Login.propTypes = {
  modal: PropTypes.bool,
  onClose: PropTypes.func,
};

export default function Login({ modal = false, onClose }) {
  const ideaId = new URLSearchParams(window.location.search).get('idea');
  const invitationId = new URLSearchParams(window.location.search).get('iid');

  const content = (
    <Stack
      justifyContent="center"
      alignItems="center"
      spacing={2}
      sx={{
        width: '100%',
        minWidth: modal ? '350px' : '400px',
        p: modal ? 3 : 0,
      }}
    >
      <Logo
        sx={{
          zIndex: 9,
          ml: 2,
          pt: 1,
        }}
      />
      <Typography variant="h3">Welcome to Altan</Typography>
      {/* <WelcomeAnimation /> */}

      {/* Google Auth first */}
      <AuthWithSocial
        idea={ideaId}
        invitation={invitationId}
      />

      {/* Email/Password form */}
      <AuthLoginForm
        idea={ideaId}
        invitation={invitationId}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Typography variant="body2">New user?</Typography>

        <Link
          component={RouterLink}
          to={`${PATH_AUTH.register}${window.location.search}`}
          variant="subtitle2"
        >
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  if (modal) {
    return (
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            overflow: 'visible',
          },
        }}
      >
        {onClose && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        )}
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 0,
          }}
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh', // Use dynamic viewport height for mobile
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        // Ensure scrolling works on mobile
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: {
            xs: 'flex-start', // Start from top on mobile
            md: 'center', // Center on desktop
          },
          alignItems: 'center',
          flex: 1,
          py: { xs: 4, md: 0 }, // Add vertical padding on mobile
          px: { xs: 2, md: 3 }, // Reduce horizontal padding on mobile
        }}
      >
        {content}
      </Container>
    </Box>
  );
}
