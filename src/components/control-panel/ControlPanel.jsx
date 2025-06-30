import React, { memo } from 'react';

import { cn } from '@lib/utils';

import Iconify from '../iconify/Iconify.jsx';

const DynamicButtonGroup = ({
  icon,
  title,
  disabled = false,
  onClick = null,
  children,
  className,
}) => {
  return (
    <div className="relative group">
      {/* Main button */}
      <button
        title={title}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full shadow-md duration-200',
          !!onClick
            ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition transition-colors'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition transition-all transform scale-110 hover:scale-105',
          className,
        )}
        disabled={disabled}
        onClick={onClick}
      >
        <Iconify
          icon={icon}
          className="text-gray-700 dark:text-gray-200"
        />
      </button>

      {/* Child buttons */}
      <div
        className="absolute flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto px-2"
        // style={{
        //   left: Math.min(
        //     56, // Distance to the right of the main button
        //     window.innerWidth - 56 * (children.length + 1), // Ensure buttons do not overflow
        //   ),
        //   top: `calc(50% - ${(children.length * 40) / 2}px)`, // Dynamically center vertically
        // }}
        style={{
          left: 'calc(100%)', // Position to the right of the main button
          bottom: 'calc(0px)', // Align with the bottom of the main button
          maxHeight: 'calc(100vh - 10px)', // Prevent overflow at the top
          overflowY: 'auto', // Add scrolling if there are too many child buttons
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ControlPanel = ({ className, buttonClassName, groupClassName, buttons = [] }) => {
  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg',
        className,
      )}
    >
      {buttons.map((button, index) => (
        <DynamicButtonGroup
          key={index}
          icon={button.icon}
          title={button.title}
          onClick={button.onClick}
          className={groupClassName}
          disabled={button.disabled}
        >
          {button.children?.map((child, idx) => (
            <button
              key={idx}
              title={child.title}
              onClick={child.onClick}
              disabled={child.disabled}
              className={cn(
                'dynamicgroup flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full shadow-md transition-all duration-200',
                buttonClassName,
              )}
            >
              <Iconify
                icon={child.icon}
                className="text-gray-700 dark:text-gray-200"
              />
            </button>
          ))}
        </DynamicButtonGroup>
      ))}
    </div>
  );
};

export default memo(ControlPanel);
