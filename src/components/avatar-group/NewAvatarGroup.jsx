import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { memo } from 'react';

import StaticGradientAvatar from '../agents/StaticGradientAvatar';
import { CustomAvatar } from '../custom-avatar';

// ----------------------------------------------------------------------

const getCharAtName = (name) => name && name.charAt(0).toUpperCase();

const getColorByName = (name) => {
  if (['A', 'N', 'H', 'L', 'Q'].includes(getCharAtName(name))) return 'primary';
  if (['F', 'G', 'T', 'I', 'J'].includes(getCharAtName(name))) return 'info';
  if (['K', 'D', 'Y', 'B', 'O'].includes(getCharAtName(name))) return 'success';
  if (['P', 'E', 'R', 'S', 'U'].includes(getCharAtName(name))) return 'warning';
  if (['V', 'W', 'X', 'M', 'Z'].includes(getCharAtName(name))) return 'error';
  return 'default';
};

// ----------------------------------------------------------------------

/**
 * Avatar component that renders user or agent avatars with fallback to initials
 */
const AvatarItem = memo(({ item, size = 20, onClick }) => {
  const theme = useTheme();
  const isAgent = !!item.avatar_url || !!item.meta_data?.avatar_orb;
  const isUser = !!item.email || !!item.first_name;

  // For agents
  if (isAgent && !isUser) {
    const hasAvatarUrl = item.avatar_url && item.avatar_url.trim() !== '';

    if (hasAvatarUrl) {
      return (
        <CustomAvatar
          src={item.avatar_url}
          alt={item.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
          }}
          name={item.name}
          className="transition-transform hover:scale-110"
        />
      );
    }

    return (
      <StaticGradientAvatar
        size={size}
        colors={item?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1']}
        className="transition-transform hover:scale-110"
      />
    );
  }

  // For users
  const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email;
  const hasAvatarUrl = item.avatar_url && item.avatar_url.trim() !== '';

  if (hasAvatarUrl) {
    return (
      <CustomAvatar
        src={item.avatar_url}
        alt={fullName}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
        }}
        name={fullName}
        className="transition-transform hover:scale-110"
      />
    );
  }

  // Fallback to initials with colored background
  const charAtName = getCharAtName(fullName);
  const colorByName = getColorByName(fullName);

  return (
    <div
      className="rounded-full flex items-center justify-center font-medium transition-transform hover:scale-110"
      style={{
        width: size,
        height: size,
        backgroundColor: theme.palette[colorByName]?.main || theme.palette.grey[400],
        color: theme.palette[colorByName]?.contrastText || theme.palette.common.white,
        fontSize: size * 0.4,
      }}
    >
      {charAtName}
    </div>
  );
});

AvatarItem.propTypes = {
  item: PropTypes.object.isRequired,
  size: PropTypes.number,
  onClick: PropTypes.func,
};

// ----------------------------------------------------------------------

/**
 * NewAvatarGroup - Displays a group of avatars (users and agents) with overlap
 * @param {Array} items - Array of user or agent objects
 * @param {number} size - Size of each avatar in pixels
 * @param {number} limit - Maximum number of avatars to show before "+N"
 * @param {Function} onItemClick - Click handler for items (optional)
 */
const NewAvatarGroup = ({ items = [], size = 20, limit = 3, onItemClick }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const visibleItems = items.length >= limit ? items.slice(0, limit - 1) : items;
  const remainingCount = items.length >= limit ? items.length - (limit - 1) : 0;

  const getItemName = (item) => {
    if (item.name) return item.name;
    return `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || 'Unknown';
  };

  return (
    <div className="flex items-center">
      {visibleItems.map((item, index) => {
        const itemName = getItemName(item);
        const isClickable = typeof onItemClick === 'function';

        const content = (
          <span
            className={`inline-flex items-center ${index !== 0 ? '-ml-2' : ''}`}
            style={{ zIndex: items.length - index }}
            title={itemName}
          >
            <span className="rounded-full inline-block overflow-hidden border-2 border-white dark:border-gray-800 duration-200">
              <AvatarItem
                item={item}
                size={size}
              />
            </span>
          </span>
        );

        if (isClickable) {
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item, e);
              }}
              className={`inline-flex items-center ${index !== 0 ? '-ml-2' : ''} hover:z-50 transition-all`}
              style={{ zIndex: items.length - index }}
              title={itemName}
            >
              <span className="rounded-full inline-block overflow-hidden border-2 border-white dark:border-gray-800 duration-200">
                <AvatarItem
                  item={item}
                  size={size}
                />
              </span>
            </button>
          );
        }

        return <React.Fragment key={item.id}>{content}</React.Fragment>;
      })}

      {remainingCount > 0 && (
        <span
          className="inline-flex items-center -ml-2"
          style={{ zIndex: 0 }}
          title={`${remainingCount} more`}
        >
          <span
            className="rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 duration-200 flex justify-center items-center text-gray-900 dark:text-gray-100 font-semibold"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
          >
            +{remainingCount}
          </span>
        </span>
      )}
    </div>
  );
};

NewAvatarGroup.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  size: PropTypes.number,
  limit: PropTypes.number,
  onItemClick: PropTypes.func,
};

export default memo(NewAvatarGroup);
