// Suggestion Group Component - for compact grouped suggestions
const SuggestionGroup = ({ children }) => {
  return (
    <div className="my-3 p-4 bg-gradient-to-br from-white/60 to-gray-50/40 dark:from-gray-800/20 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/50 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Next steps</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

export default SuggestionGroup;