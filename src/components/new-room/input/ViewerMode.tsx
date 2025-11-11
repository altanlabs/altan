import React from 'react';
import { Button } from '@/components/ui/button';
import { EyeIcon } from './icons';

interface ViewerModeProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ViewerMode: React.FC<ViewerModeProps> = ({ containerRef }) => {
  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center space-y-3 mb-4 text-center p-4"
    >
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <EyeIcon />
        <span className="text-sm font-medium">Read-only mode</span>
      </div>
      <Button variant="outline">Join Room</Button>
    </div>
  );
};

