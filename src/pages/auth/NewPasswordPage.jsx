import { Link, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

// @mui
// routes
import { SentIcon } from '../../assets/icons';
import Iconify from '../../components/iconify';
import { PATH_AUTH } from '../../routes/paths';
// components
// sections
import AuthNewPasswordForm from '../../sections/auth/AuthNewPasswordForm';
// assets

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  return (
    <>
      <Helmet>
        <title> New Password · Altan</title>
      </Helmet>

      <SentIcon sx={{ mb: 5, height: 96 }} />

      <Typography
        variant="h3"
        paragraph
      >
        Request sent successfully!
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        We&apos;ve sent a 6-digit confirmation email to your email.
        <br />
        Please enter the code in below box to verify your email.
      </Typography>

      <AuthNewPasswordForm />

      <Typography
        variant="body2"
        sx={{ my: 3 }}
      >
        Don’t have a code? &nbsp;
        <Link variant="subtitle2">Resend code</Link>
      </Typography>

      <Link
        component={RouterLink}
        to={PATH_AUTH.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          mx: 'auto',
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify
          icon="eva:chevron-left-fill"
          width={16}
        />
        Return to sign in
      </Link>
    </>
  );
}
