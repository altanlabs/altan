import { memo } from 'react';

const ResourceCard = ({ resource }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-2">
    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{resource.name}</h4>
    {Object.entries(resource.details)
      .filter(([_, value]) => typeof value !== 'object')
      .map(([key, value]) => (
        <p
          key={key}
          className="text-xs text-gray-600 dark:text-gray-400"
        >
          {`${key.replace(/_/g, ' ')}: ${value}`}
        </p>
      ))}
  </div>
);

export default memo(ResourceCard);
