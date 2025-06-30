import { memo } from 'react';

function BinaryFilePlaceholder({ filePath }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <p className="mb-2">Binary file cannot be displayed</p>
      <p className="text-sm">{filePath}</p>
    </div>
  );
}

export default memo(BinaryFilePlaceholder);
