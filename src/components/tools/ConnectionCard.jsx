import React, { memo } from 'react';

import useAccountUser from '../../hooks/useAccountUser';
import { fToNow } from '../../utils/formatTime';
import { CustomAvatar } from '../custom-avatar';
import ResourceCard from './ResourceCard';

const ConnectionCard = ({ connection }) => {
  const { user_id, name, connection_type, date_creation, resources } = connection ?? {};

  const created_by = useAccountUser(user_id);

  return (
    <div className="max-w-md mx-auto backdrop-blur-xl shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 space-y-2">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Connection: {name}</h2>
        <p className="text-gray-600 dark:text-gray-400">Type: {connection_type.name}</p>
        {!!created_by && (
          <div className="flex flex-row items-center">
            <CustomAvatar
              sx={{ width: 24, height: 24, mr: 1 }}
              name={created_by?.user?.person?.first_name}
              src={created_by?.user?.person?.avatar_url}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Created by {created_by?.user?.person?.first_name}{' '}
              {created_by?.user?.person?.last_name}
            </p>
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-400">{fToNow(date_creation)}</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 max-h-[300px] relative overflow-y-auto space-y-1">
        <h3 className="sticky top-0 before:backdrop-blur-xl before:backdrop-hack text-md font-semibold text-gray-800 dark:text-gray-200">
          Resources ({resources?.items?.length ?? 0})
        </h3>
        <ul className="space-y-2">
          {!resources?.items?.length
            ? null
            : resources.items.map((resource) => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default memo(ConnectionCard);
