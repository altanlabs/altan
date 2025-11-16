import { Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function Page403() {
  return (
    <>
      <Helmet>
        <title>403 – Access denied to the fun part · Altan</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 dark:bg-neutral-950">
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <Lock className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
          </div>

          {/* Hero */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              403 – Access denied
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You don&apos;t have permission to access this resource. Upgrade your plan to unlock it.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex w-full flex-col gap-2">
            <Link
              to="/"
              className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-neutral-900 bg-neutral-900 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Go back home
            </Link>

            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/pricing"
                className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Pricing
              </Link>
              <a
                href="https://docs.altan.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Docs
              </a>
              <a
                href="https://www.altan.ai/support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
