import React, { useState } from "react";
import { useAuth } from "../AuthProvider";
import '../styles.css';
import Google from '../assets/Google';

interface SignInProps {
  appearance?: {
    theme?: 'light' | 'dark';
  };
  companyName?: string;
  routing?: 'hash' | 'path';
  path?: string;
  signUpUrl?: string;
  forceRedirectUrl?: string;
  fallbackRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
  initialValues?: {
    emailAddress?: string;
    password?: string;
  };
  transferable?: boolean;
  waitlistUrl?: string;
  withSignUp?: boolean;
}

export default function SignIn({
  appearance = { theme: 'light' },
  companyName,
  signUpUrl = '/sign-up',
  routing = 'path',
  withSignUp = true,
  ...props
}: SignInProps) {
  const { continueWithGoogle, login, isLoading, isAuthenticated, error } = useAuth();
  const [email, setEmail] = useState(props.initialValues?.emailAddress || "");
  const [password, setPassword] = useState(props.initialValues?.password || "");

  // Theme styles object
  const theme = {
    light: {
      background: "bg-white",
      card: "bg-white",
      text: "text-gray-900",
      textMuted: "text-gray-600",
      input: "bg-white text-gray-900 border-gray-300",
      button: "bg-black hover:bg-gray-900 text-white",
      googleButton: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
      error: {
        background: "bg-red-50",
        text: "text-red-800",
        icon: "text-red-400"
      }
    },
    dark: {
      background: "bg-gray-900",
      card: "bg-gray-800",
      text: "text-white",
      textMuted: "text-gray-300",
      input: "bg-gray-800 text-white border-gray-600",
      button: "bg-white hover:bg-gray-100 text-black",
      googleButton: "bg-gray-800 hover:bg-gray-700 text-white border-gray-600",
      error: {
        background: "bg-red-900/20",
        text: "text-red-200",
        icon: "text-red-400"
      }
    }
  }[appearance.theme || 'light'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  if (isAuthenticated) return null;

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (routing === 'hash') {
      window.location.hash = signUpUrl;
    } else {
      window.location.href = signUpUrl;
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 className={`text-center text-3xl font-bold ${theme.text}`}>
          {companyName ? `Sign in to ${companyName}` : "Sign in"}
        </h2>
        <p className={`mt-2 text-center text-sm ${theme.textMuted}`}>
          Welcome back! Please sign in to continue
        </p>
      </div>

      <button
        onClick={() => continueWithGoogle()}
        className={`w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${theme.googleButton}`}
      >
        <span className="flex items-center">
          <Google />
          <span className="ml-2">Continue with Google</span>
        </span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={`px-2 ${theme.card} ${theme.textMuted}`}>or</span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className={`block text-sm font-medium ${theme.text}`}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium ${theme.text}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className={`rounded-md ${theme.error.background} p-4`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${theme.error.icon}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme.error.text}`}>
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.button}`}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Continue"}
        </button>
      </form>

      <div className={`mt-8 border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
        {withSignUp && (
          <div className="text-center mb-4">
            <span className={theme.textMuted}>Don't have an account? </span>
            <a
              href={signUpUrl}
              onClick={handleSignUpClick}
              className="text-blue-600 hover:text-blue-400"
            >
              Sign up
            </a>
          </div>
        )}

        <div className={`flex items-center justify-center space-x-2 text-xs ${theme.textMuted}`}>
          <span>Secured by</span>
          <img
            src={
              appearance.theme === "dark"
                ? "https://altan.ai/logos/horizontalWhite.png"
                : "https://altan.ai/logos/horizontalBlack.png"
            }
            alt="Altan"
            className="h-3"
          />
        </div>
      </div>
    </div>
  );
}

export type { SignInProps };
