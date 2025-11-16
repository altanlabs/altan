import { Search, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function Page404() {
  return (
    <>
      <Helmet>
        <title>404 – This page doesn&apos;t exist. But the product you wanted could… · Altan</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 dark:bg-neutral-950">
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <Search className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
          </div>

          {/* Hero */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              404 – Page not found
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              This page doesn&apos;t exist. But you can build what you&apos;re looking for with Altan in minutes.
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

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/app"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <Sparkles className="h-3 w-3" />
                Start building
              </Link>
              <Link
                to="/pricing"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Pricing
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://docs.altan.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Docs
              </a>
              <a
                href="https://www.altan.ai/support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
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
