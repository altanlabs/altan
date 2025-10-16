import { cn } from '@lib/utils';

// Question Option Component - individual option within a question group
const QuestionOption = ({ children, value, isSelected, isRecommended, onSelect, groupId }) => {
  const handleClick = () => {
    onSelect(groupId, value || (typeof children === 'string' ? children : ''));
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
        'hover:scale-[1.01] active:scale-[0.98] shadow-sm hover:shadow-md',
        'backdrop-blur-md border-2',
        // Selected state
        isSelected && 'bg-blue-500/12 dark:bg-blue-500/25 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-white',
        // Recommended state (when not selected)
        !isSelected && isRecommended && 'bg-green-500/6 dark:bg-green-500/10 border-green-500/40 dark:border-green-500/50 text-gray-800 dark:text-gray-200',
        // Default state (when not selected and not recommended)
        !isSelected && !isRecommended && 'bg-white/80 dark:bg-gray-700/50 border-gray-400/30 dark:border-gray-600/40 text-gray-800 dark:text-gray-200',
        // Hover states
        !isSelected && isRecommended && 'hover:bg-green-500/10 dark:hover:bg-green-500/15 hover:border-green-500/50 dark:hover:border-green-500/60',
        !isSelected && !isRecommended && 'hover:bg-gray-500/8 dark:hover:bg-gray-600/20 hover:border-gray-500/40 dark:hover:border-gray-500/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 leading-snug flex items-center gap-2">
          {children}
          {isRecommended && !isSelected && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-500/15 dark:bg-green-500/25 text-green-600 dark:text-green-400">
              Recommended
            </span>
          )}
        </span>
        <div
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all',
            isSelected
              ? 'bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400'
              : 'bg-transparent border-gray-400/40 dark:border-gray-500/50',
          )}
        >
          {isSelected && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default QuestionOption;
