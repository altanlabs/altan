import { createSelector } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../../../components/iconify';
import IconRenderer from '../../../../../components/icons/IconRenderer';
import { selectConnectionTypes } from '../../../../../redux/slices/connections';
import { selectCustomConnectionTypes } from '../../../../../redux/slices/general';
import { useSelector } from '../../../../../redux/store';

const selectAllConnectionTypes = createSelector(
  [selectConnectionTypes, selectCustomConnectionTypes],
  (conns, myConns) => [...conns, ...(myConns ?? [])],
);

const WorkflowTemplateCard = ({ template }) => {
  const history = useHistory();;
  const allConnectionTypes = useSelector(selectAllConnectionTypes);

  const name = template.name || template.public_name || 'Unnamed Template';
  const authorName = template.parent?.name || template.author?.name || 'Unknown';
  const remixCount = template.remix_count || 0;

  const handleClick = () => {
    history.push(`/template/${template.id}`);
  };

  // Get connection types
  const getConnectionTypes = () => {
    const connectionTypeIds =
      template.parent?.meta_data?.connection_types || template.meta_data?.connection_types || [];

    if (connectionTypeIds.length > 0) {
      return connectionTypeIds
        .map((typeId) => allConnectionTypes.find((connType) => connType.id === typeId))
        .filter(Boolean);
    }
    return [];
  };

  const connectionTypes = getConnectionTypes();

  return (
    <div
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      {/* Main Area - Connection Type Icons */}
      <div className="relative h-40 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-4">
        {/* Connection Type Icons Display */}
        <div className="flex items-center justify-center flex-wrap gap-3">
          {connectionTypes.length > 0 ? (
            connectionTypes.slice(0, 5).map((connectionType) => (
              <div
                key={connectionType.id}
                className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center"
                title={connectionType.name}
              >
                <IconRenderer
                  icon={connectionType?.external_app?.icon || connectionType.icon}
                  size={28}
                />
              </div>
            ))
          ) : (
            // Fallback icon when no connection types
            <div className="opacity-20">
              <Iconify
                icon="carbon:flow"
                width={60}
                className="text-gray-400"
              />
            </div>
          )}

          {connectionTypes.length > 5 && (
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
              +{connectionTypes.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1">
        {/* Workflow Name */}
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-1">
          {name}
        </h3>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-xs">
          {/* Author */}
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <span>{authorName}</span>
          </div>

          {/* Stats and Price */}
          <div className="flex items-center gap-3">
            {/* Fork Count */}
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Iconify
                icon="carbon:fork"
                width={14}
              />
              <span>{remixCount}</span>
            </div>

            {/* Price */}
            {template?.price !== undefined && (
              <div
                className={`font-semibold ${
                  template.price > 0
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {template.price > 0
                  ? `€${(template.price / 100).toFixed(0)}`
                  : 'Free'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

WorkflowTemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
};

export default WorkflowTemplateCard;
