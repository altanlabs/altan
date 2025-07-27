import { memo } from 'react';

import { cn } from '@lib/utils';

const getMessageBoxClasses = (type: string, isMe: boolean): string => {
  const baseClasses = isMe
    ? 'relative justify-start text-left text-[15px] opacity-100 rounded-3xl w-full'
    : 'relative justify-start text-left text-[15px] opacity-100 rounded-3xl w-full';

  const themeClasses =
    type === 'success'
      ? 'text-green-500 dark:text-green-400'
      : type === 'error'
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-900 dark:text-gray-100';

  const backgroundClasses = isMe ? 'bg-gray-100 dark:bg-gray-700' : 'bg-transparent';

  return cn(baseClasses, themeClasses, backgroundClasses);
};

interface MessageBoxProps {
  type?: string;
  isMe: boolean;
  children: React.ReactNode;
  timestamp?: string;
  className?: string;
}

const MessageBox = ({ type = '', isMe, children, className }: MessageBoxProps) => {
  return (
    <div className={cn(getMessageBoxClasses(type, isMe), className)}>
      <div
        className={cn(
          'text-left',
          'px-4 pt-1 pb-1',
          'leading-snug',
          'will-change-transform opacity-100',
          'subpixel-antialiased',
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default memo(MessageBox);
