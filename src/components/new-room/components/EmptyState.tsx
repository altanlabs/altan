import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  showVoiceButton?: boolean;
  onVoiceClick?: () => void;
  isVoiceConnecting?: boolean;
}

export function EmptyState({
  title = "How can I help you today?",
  description,
  suggestions = [],
  onSuggestionClick,
  showVoiceButton = false,
  onVoiceClick,
  isVoiceConnecting = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-normal text-gray-800 dark:text-gray-200">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        {/* Voice Button */}
        {showVoiceButton && (
          <div className="flex justify-center">
            <Button
              onClick={onVoiceClick}
              disabled={isVoiceConnecting}
              variant="outline"
              className="gap-2"
            >
              {isVoiceConnecting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                  <span>Start Voice Call</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

