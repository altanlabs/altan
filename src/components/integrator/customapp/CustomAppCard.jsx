import { m } from 'framer-motion';
import { memo } from 'react';

import { cn } from '@lib/utils';

import IconRenderer from '../../icons/IconRenderer';

function CustomAppCard({ item, onEdit, onDelete, mini = false }) {
  return (
    <m.div
      onClick={() => (!onEdit ? null : onEdit(item.id))}
      className={cn(
        'group ',
        !mini &&
          'rounded-xl shadow-lg cursor-pointer bg-white dark:bg-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300',
      )}
    >
      <div className="flex items-center gap-4 pr-6 relative">
        <IconRenderer
          icon={item.icon}
          size={mini ? 25 : 40}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-medium text-gray-900 dark:text-gray-100',
                mini ? 'text-sm' : 'text-lg',
              )}
            >
              {item.name}
            </span>
          </div>
          <p
            className={cn(
              'text-sm text-gray-500 dark:text-gray-400',
              mini && 'truncate text-xs w-full',
            )}
          >
            {item.description}
          </p>
        </div>
        {!!onDelete && (
          <m.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute opacity-0 group-hover:opacity-60 hover:!opacity-100 right-1 text-sm font-semibold text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700
                     transition-all duration-300 px-3 py-1 rounded-lg shadow-lg
                     hover:shadow-red-500/40 dark:hover:shadow-red-700/40 scale-90 hover:scale-105"
          >
            Delete
          </m.button>
        )}
      </div>
    </m.div>
  );
}

export default memo(CustomAppCard);
