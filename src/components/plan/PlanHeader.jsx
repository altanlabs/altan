import { Tooltip } from '@mui/material';

import Iconify from '../iconify/Iconify';
import CustomMarkdown from '../messages/CustomMarkdown';

const PlanHeader = ({ plan, isApproving, onApprove, onClose }) => (
  <div className="mt-4 mb-6 flex items-start justify-between gap-4">
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {plan.title || 'Untitled Plan'}
        </h1>
      </div>
      {plan.description && (
        <div className=" text-sm">
          <CustomMarkdown text={plan.description} />
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Approve Button - Only show if not approved */}
      {!plan.is_approved && (
        <Tooltip title="Approve Plan">
          <button
            onClick={() => onApprove(true)}
            disabled={isApproving}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <div className="flex items-center gap-2">
                <Iconify icon="mdi:loading" className="w-4 h-4 animate-spin" />
                <span>Approving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Iconify icon="mdi:check-circle" className="w-4 h-4" />
                <span>Approve Plan</span>
              </div>
            )}
          </button>
        </Tooltip>
      )}
      {/* Close Button */}
      <Tooltip title="Close Plan View">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Iconify icon="mdi:close" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </Tooltip>
    </div>
  </div>
);

export default PlanHeader;

