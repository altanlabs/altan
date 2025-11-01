import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useAuthContext } from '../../auth/useAuthContext';
import Logo from '../../components/logo/Logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import AuthLoginForm from './AuthLoginForm';
import AuthRegisterForm from './AuthRegisterForm';

// ----------------------------------------------------------------------

AuthDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  invitation: PropTypes.object,
  idea: PropTypes.any,
};

export default function AuthDialog({ open, onOpenChange, invitation = null, idea = null }) {
  const { loginWithGoogle } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      if (loginWithGoogle) {
        await loginWithGoogle();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center space-y-4">
          <Logo className="w-22 h-22" />
          <DialogTitle className="text-3xl font-bold">Welcome to Altan</DialogTitle>
          <DialogDescription className="text-base">
            {isLogin ? 'Log in to continue' : 'Sign up to get started'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
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
                  Don't have an account?{' '}
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
