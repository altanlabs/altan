import { memo } from 'react';

import { cn } from '@lib/utils';

const getMessageBoxClasses = (type: string, isMe: boolean): string => {
  const baseClasses = 'w-full relative justify-start text-left text-[15px] opacity-100';
  const themeClasses =
    type === 'success'
      ? 'text-green-500 dark:text-green-400'
      : type === 'error'
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-700 dark:text-gray-300';

  const borderRadiusClasses = isMe
    ? 'rounded-tr-none rounded-tl-[15px] rounded-br-[15px]'
    : 'rounded-tl-none rounded-tr-[15px] rounded-bl-[15px]';

  return cn(baseClasses, themeClasses, borderRadiusClasses);
};

interface MessageBoxProps {
  type: string;
  isMe: boolean;
  children: React.ReactNode;
}

const MessageBox = ({ type, isMe, children }: MessageBoxProps) => {
  return (
    <div className={getMessageBoxClasses(type, isMe)}>
      <div
        className={cn(
          'text-left',
          'p-1',
          'leading-relaxed',
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
