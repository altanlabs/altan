import { AlertTriangle, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function Page500() {
  const [errorRef] = useState(() => `500-${Date.now().toString(36).toUpperCase()}`);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <Helmet>
        <title>500 – Our agent squad tripped over an internal error · Altan</title>
      </Helmet>

      <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
        {/* Status bar */}
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-900 dark:bg-neutral-100" />
              <span className="font-mono text-neutral-900 dark:text-neutral-100">Incident #{errorRef}</span>
            </div>
            <span className="hidden text-neutral-600 dark:text-neutral-400 sm:inline">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <AlertTriangle className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
            </div>

            {/* Hero */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                500 – Something went wrong
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                We&apos;re on it. Your data is safe. Try again or go back home.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex w-full flex-col gap-2">
              <button
                onClick={handleReload}
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-neutral-900 bg-neutral-900 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <RotateCw className="h-4 w-4" />
                Retry
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Go home
                </Link>
                <a
                  href="https://www.altan.ai/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Get help
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://docs.altan.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Docs
                </a>
                <Link
                  to="/pricing"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
