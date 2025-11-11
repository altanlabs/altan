import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this room. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="max-w-md w-full space-y-4">
        {/* Error Icon */}
        <div className="flex justify-center">
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400">{message}</p>

        {/* Retry Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
