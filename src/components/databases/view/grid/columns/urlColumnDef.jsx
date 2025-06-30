import { getDefaultColumnDef } from './defaultColumnDef';
import Iconify from '../../../../iconify';

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

// Function to get domain from URL
const getDomainFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

export const getUrlColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  ...getDefaultColumnDef({
    field,
    getCommonFieldMenuItems,
    additionalProps: {
      width: 220, // Set fixed width for better display
      maxWidth: 300,
      valueParser: (params) => {
        if (!params.newValue) return null;
        const trimmed = params.newValue.trim();
        if (!isValidUrl(trimmed)) {
          throw new Error('Please enter a valid URL');
        }
        return trimmed;
      },
      cellRenderer: (params) => {
        if (!params.value) return null;
        const isValid = isValidUrl(params.value);
        const displayText = isValid ? getDomainFromUrl(params.value) : params.value;
        // If the URL is too long, truncate it
        const truncatedValue =
          displayText.length > 30 ? `${displayText.substring(0, 27)}...` : displayText;

        return (
          <div className="flex items-center gap-2 w-full">
            {isValid ? (
              <div
                className="rounded-full py-1 px-2 flex items-center gap-1 max-w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                style={{ maxWidth: '100%' }}
              >
                <Iconify
                  icon="mdi:link-variant"
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="truncate text-xs"
                  title={params.value}
                >
                  {truncatedValue}
                </span>
                <Iconify
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(params.value, '_blank');
                  }}
                  icon="mdi:open-in-new"
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    cursor: 'pointer',
                    marginLeft: 2,
                  }}
                />
              </div>
            ) : (
              <div
                className="truncate text-error"
                title={params.value}
              >
                {truncatedValue}
              </div>
            )}
          </div>
        );
      },
      cellClass: (params) => {
        if (!params.value) return 'border-r border-gray-200';
        const baseClasses = 'border-r border-gray-200';
        return isValidUrl(params.value) ? baseClasses : `${baseClasses} bg-error-lighter`;
      },
      tooltipField: field.db_field_name, // Show full URL in tooltip
    },
  }),
});
