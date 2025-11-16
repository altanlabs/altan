import { Wrench, Home } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function MaintenancePage() {
  const [eta] = useState(() => {
    const now = new Date();
    const estimatedEnd = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    return estimatedEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  return (
    <>
      <Helmet>
        <title>Maintenance – We&apos;re upgrading the agent infrastructure · Altan</title>
      </Helmet>

      <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
        {/* Status bar */}
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-600 dark:bg-amber-500" />
              <span className="font-mono text-neutral-900 dark:text-neutral-100">Scheduled maintenance in progress</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
              <span className="hidden sm:inline">ETA: {eta}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <Wrench className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
            </div>

            {/* Hero */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                Scheduled maintenance
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                We&apos;re upgrading the platform. All data is safe. Expected downtime: 30-60 minutes.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex w-full flex-col gap-2">
              <Link
                to="/"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-neutral-900 bg-neutral-900 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Home className="h-4 w-4" />
                Go back home
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.altan.ai/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Support
                </a>
                <a
                  href="https://docs.altan.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
