import React, { memo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { m } from 'framer-motion';

const DesktopAppIcon = ({ 
  id, 
  name, 
  iconUrl, 
  isWorking = false,
  isPinned = false,
  onContextMenu 
}) => {
  const history = useHistory();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    history.push(`/project/${id}`);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, { id, name, iconUrl, isPinned });
    }
  };

  return (
    <m.div
      className="flex flex-col items-center justify-center cursor-pointer select-none group"
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon Container - Much larger like macOS */}
      <div className="relative mb-3">
        {/* Icon */}
        <div 
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-[22px] bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-200 group-hover:shadow-2xl"
        >
          {iconUrl ? (
            <img 
              src={iconUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Working Indicator */}
        {isWorking && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}

        {/* Pinned Indicator */}
        {isPinned && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900">
            <svg className="w-full h-full p-0.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L7 8H3l7 5-2 7 7-5 7 5-2-7 7-5h-4l-3-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* App Name - Larger and clearer like macOS */}
      <div className="max-w-[120px] sm:max-w-[140px] text-center">
        <p 
          className={`text-sm font-medium text-gray-900 dark:text-white truncate px-2 py-1 rounded-md transition-all duration-200 ${
            isHovered ? 'bg-white/20 dark:bg-white/10 backdrop-blur-sm' : ''
          }`}
        >
          {name}
        </p>
      </div>
    </m.div>
  );
};

export default memo(DesktopAppIcon);

