import Iconify from '../iconify/Iconify';

export const PlanLoading = () => (
  <div className="w-full h-full relative overflow-hidden pb-2 px-2">
    <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg p-8 max-w-md">
          <div className="flex items-center gap-3">
            <Iconify icon="mdi:loading" className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-base text-gray-600 dark:text-gray-400">Loading plan...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PlanError = ({ error, onClose }) => (
  <div className="w-full h-full relative overflow-hidden pb-2 px-2">
    <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl backdrop-blur-lg p-8 max-w-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <Iconify icon="mdi:alert-circle" className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-base font-medium text-red-700 dark:text-red-300 mb-2">Plan rejected</p>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const EmptyPlanState = () => (
  <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
    <Iconify icon="mdi:road-variant" className="w-12 h-12 mx-auto mb-3 opacity-50" />
    <p>No items in this roadmap</p>
  </div>
);

