// MemberCard.js
import Tooltip from '@mui/material/Tooltip';
import { m } from 'framer-motion';
import React, { memo } from 'react';

import { CustomAvatar } from '../custom-avatar';

function MemberCard({ userItem, id, roles }) {
  return (
    <>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
            {/* {userItem.user.person.first_name[0]}
            {userItem.user.person.last_name[0]} */}
            <CustomAvatar
              sx={{ width: 48, height: 48 }}
              name={userItem.user.person?.first_name}
              src={userItem.user.person?.avatar_url}
            />
          </div>
        </div>
        <div className="ml-4">
          <m.h3
            layoutId={`name-${userItem.user.id}-${id}`}
            className="text-lg font-semibold text-gray-800 dark:text-gray-200"
          >
            {userItem.user.person?.first_name} {userItem.user.person?.last_name}
          </m.h3>
          <m.p
            layoutId={`email-${userItem.user.id}-${id}`}
            className="text-gray-600 dark:text-gray-400"
          >
            {userItem.user.email}
          </m.p>
        </div>
      </div>
      {/* Type Chip */}
      <div className="mt-4">
        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
          {userItem.type === 'account' ? 'workspace' : userItem.type}
        </span>
      </div>
      {/* Role Chips */}
      <div className="mt-4 overflow-x-auto">
        <div className="flex space-x-2">
          {userItem.roles.length > 0 ? (
            userItem.roles.map((role) => {
              const roleInfo = roles[role.role_id];
              if (roleInfo) {
                return (
                  <Tooltip
                    key={role.role_id}
                    label={roleInfo.meta_data.description}
                    aria-label={roleInfo.meta_data.description}
                  >
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                      {roleInfo.name}
                    </span>
                  </Tooltip>
                );
              }
              return null;
            })
          ) : (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Owner
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(MemberCard);
