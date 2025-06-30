import { Link, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

// @mui
// routes
import { PasswordIcon } from '../../assets/icons';
import Iconify from '../../components/iconify';
import { PATH_AUTH } from '../../routes/paths';
// components
// sections
import AuthResetPasswordForm from '../../sections/auth/AuthResetPasswordForm';
// assets

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Reset Password · Altan</title>
      </Helmet>

      <PasswordIcon sx={{ mb: 5, height: 96 }} />

      <Typography
        variant="h3"
        paragraph
      >
        Forgot your password?
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        Please enter the email address associated with your account and We will email you a link to
        reset your password.
      </Typography>

      <AuthResetPasswordForm />

      <Link
        component={RouterLink}
        to={PATH_AUTH.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          mt: 3,
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
