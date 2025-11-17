import { ChevronLeft, Mail, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import { useSnackbar } from '../../components/snackbar';
import { PATH_AUTH } from '../../routes/paths';
import AuthVerifyCodeForm from '../../sections/auth/AuthVerifyCodeForm';

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

        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
          <div className="mb-8 rounded-full bg-primary/10 p-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-3">
            Verifying your email...
          </h1>

          <p className="text-muted-foreground text-center text-sm">
            Please wait while we verify your email address.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title> Verify Code · Altan</title>
      </Helmet>

      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
        <div className="mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6">
          <Mail className="h-16 w-16 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-3">
          Please check your email!
        </h1>

        <p className="text-muted-foreground text-center text-sm mb-8">
          We have emailed a 6-digit confirmation code to{' '}
          <span className="font-medium text-foreground">{user?.email}</span>. Please enter the code below to verify your email.
        </p>

        <AuthVerifyCodeForm initialCode={codeFromUrl} />

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have a code?</span>{' '}
          <button
            onClick={handleResendCode}
            className="font-medium text-primary hover:underline focus:outline-none"
          >
            Resend code
          </button>
        </div>

        <RouterLink
          to={PATH_AUTH.login}
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Return to sign in
        </RouterLink>
      </div>
    </>
  );
}
