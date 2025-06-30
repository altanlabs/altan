import { Tooltip } from '@mui/material';
import { memo } from 'react';

import Iconify from '@components/iconify/Iconify.jsx';
import { cn } from '@lib/utils'; // Utility function for conditional classNames

const EnvironmentToggle = ({ envMode, setEnvMode }) => {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-0.5 border border-gray-300 dark:border-gray-700">
      {/* Development Mode Button */}
      <Tooltip content="Development Environment">
        <button
          onClick={() => setEnvMode('dev')}
          className={cn(
            'p-1.5 rounded-xl transition-all flex items-center justify-center',
            envMode === 'dev'
              ? 'bg-white dark:bg-gray-800 text-amber-500'
              : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800',
          )}
          aria-label="Select Development Environment"
        >
          <Iconify
            icon="mdi:code-braces"
            className="text-xl"
          />
        </button>
      </Tooltip>

      {/* Production Mode Button */}
      <Tooltip content="Production Environment">
        <button
          onClick={() => setEnvMode('prod')}
          className={cn(
            'p-1.5 rounded-xl transition-all flex items-center justify-center',
            envMode === 'prod'
              ? 'bg-white dark:bg-gray-800 text-green-500'
              : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800',
          )}
          aria-label="Select Production Environment"
        >
          <Iconify
            icon="mdi:rocket-launch"
            className="text-xl"
          />
        </button>
      </Tooltip>
    </div>
  );
};

export default memo(EnvironmentToggle);
