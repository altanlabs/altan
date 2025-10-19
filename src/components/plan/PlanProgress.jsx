const PlanProgress = ({ progress }) => (
  <div className="px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Roadmap</h2>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {progress.completed} of {progress.total} completed
        </span>
        <span className="text-gray-400 dark:text-gray-500">•</span>
        <span className="font-medium text-blue-600 dark:text-blue-400">{progress.percentage}%</span>
      </div>
    </div>
    {/* Progress Bar */}
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${progress.percentage}%` }}
      />
    </div>
  </div>
);

export default PlanProgress;

