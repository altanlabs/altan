import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { Link, Typography } from '@mui/material';

import { EmailInboxIcon } from '../../assets/icons';
import { useAuthContext } from '../../auth/useAuthContext.ts';
// @mui
// routes
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import { PATH_AUTH } from '../../routes/paths';
// components
// sections
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';
// assets

// ----------------------------------------------------------------------

export default function VerifyCodePage() {
  const { user, resendVerification, verifyEmail } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptedCode, setAttemptedCode] = useState(null);

  // Extract code from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const codeFromUrl = searchParams.get('code');

  // Automatically verify if code is provided in URL
  useEffect(() => {
    if (codeFromUrl && codeFromUrl.length === 6 && !isVerifying && attemptedCode !== codeFromUrl) {
      setIsVerifying(true);
      setAttemptedCode(codeFromUrl);
      verifyEmail(codeFromUrl)
        .then(() => {
          enqueueSnackbar('Email verified successfully!');
          history.push('/');
        })
        .catch((error) => {
          console.error(error);
          enqueueSnackbar(error.message || 'Verification failed', { variant: 'error' });
          setIsVerifying(false);
          // Remove the code from URL to prevent further attempts
          history.replace(location.pathname);
        });
    }
  }, [codeFromUrl, verifyEmail, enqueueSnackbar, history, isVerifying, attemptedCode, location.pathname]);

  const handleResendCode = async () => {
    try {
      await resendVerification();
      enqueueSnackbar('Verification code resent successfully!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to resend verification code', { variant: 'error' });
    }
  };

  // If we're auto-verifying, show loading state
  if (isVerifying) {
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
          Verifying your email...
        </Typography>

        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
          Please wait while we verify your email address.
        </Typography>
      </>
    );
  }

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

      <AuthVerifyCodeForm initialCode={codeFromUrl} />

      <Typography
        variant="body2"
        sx={{ my: 3 }}
      >
        Don&apos;t have a code? &nbsp;
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
