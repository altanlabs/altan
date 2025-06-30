import { Link, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

import { EmailInboxIcon } from '../../assets/icons';
import { useAuthContext } from '../../auth/useAuthContext';
// @mui
// routes
import Iconify from '../../components/iconify';
import { PATH_AUTH } from '../../routes/paths';
// components
// sections
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';
// assets

// ----------------------------------------------------------------------

export default function VerifyCodePage() {
  const { user, resendVerification } = useAuthContext();

  const handleResendCode = async () => {
    try {
      await resendVerification();
      // You might want to show a success message here
    } catch (error) {
      // Handle error (maybe show an error message)
      console.error(error);
    }
  };

  return (
    <>
      <Helmet>
        <title> Verify Code · Altan</title>
      </Helmet>

      <EmailInboxIcon sx={{ mb: 5, height: 96 }} />

      <Typography
        variant="h3"
        paragraph
      >
        Please check your email!
      </Typography>

      <Typography sx={{ color: 'text.secondary', mb: 5 }}>
        We have emailed a 6-digit confirmation code to {user?.email}, please enter the code in below
        box to verify your email.
      </Typography>

      <AuthVerifyCodeForm />

      <Typography
        variant="body2"
        sx={{ my: 3 }}
      >
        Don't have a code? &nbsp;
        <Link
          variant="subtitle2"
          onClick={handleResendCode}
          sx={{ cursor: 'pointer' }}
        >
          Resend code
        </Link>
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
