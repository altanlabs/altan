import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import AuthLoginForm from './AuthLoginForm';
import AuthRegisterForm from './AuthRegisterForm';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import Logo from '../../components/logo/Logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { getAllTrackingParams } from '../../utils/queryParams';

// ----------------------------------------------------------------------

const ReferralBanner = () => {
  return (
    <div className="w-full rounded-lg border border-green-500/30 bg-green-500/10 p-3 mb-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎁</span>
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            You&apos;ve been referred to Altan!
          </p>
          <p className="text-xs text-muted-foreground">
            Sign up now and both you and your friend will earn $10 in free credits once you upgrade to Pro
          </p>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------

AuthDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  invitation: PropTypes.object,
  idea: PropTypes.any,
  defaultToSignup: PropTypes.bool,
};

export default function AuthDialog({ open, onOpenChange, invitation = null, idea = null, defaultToSignup = false }) {
  const { loginWithGoogle } = useAuthContext();
  const [isLogin, setIsLogin] = useState(!defaultToSignup);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);

  // Check for referral code
  useEffect(() => {
    const trackingParams = getAllTrackingParams(false);
    const referrerId = trackingParams?.ref;
    setHasReferral(!!referrerId && !invitation);
  }, [invitation]);

  // Reset form state when dialog opens with new defaultToSignup value
  React.useEffect(() => {
    if (open) {
      setIsLogin(!defaultToSignup);
    }
  }, [open, defaultToSignup]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      if (loginWithGoogle) {
        await loginWithGoogle(invitation?.id, idea);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center space-y-3">
          <Logo className="w-22 h-22" />
          <DialogTitle className="text-3xl font-bold">Welcome to Altan</DialogTitle>
          {!isLogin && !hasReferral && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30">
              <span className="text-sm">🎁</span>
              <span className="text-xs font-semibold text-primary">
                500 Free Credits
              </span>
            </div>
          )}
          <DialogDescription className="text-base">
            {isLogin ? 'Log in to continue' : 'Sign up to get started'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Referral Banner - show for signup only */}
          {hasReferral && !isLogin && (
            <ReferralBanner />
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          {/* Login/Register Forms */}
          {isLogin ? (
            <AuthLoginForm idea={idea} invitation={invitation} />
          ) : (
            <AuthRegisterForm idea={idea} invitation={invitation} />
          )}

          {/* Toggle between Login and Register */}
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Don&apos;t have an account?{' '}
                  <span className="text-foreground font-medium underline">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="text-foreground font-medium underline">Log in</span>
                </>
              )}
            </button>
          </div>

          {/* Terms and Privacy */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            By signing up, you agree to our
            <br />
            <a
              href="https://altan.ai/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:text-foreground/80"
            >
              Terms of Service
            </a>{' '}
            &{' '}
            <a
              href="https://altan.ai/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:text-foreground/80"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
