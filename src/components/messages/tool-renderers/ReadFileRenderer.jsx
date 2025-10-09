import { Icon } from '@iconify/react';
import React, { memo, useMemo } from 'react';

/**
 * Custom renderer for read_file tool
 * Displays file path and basic metadata
 */
const ReadFileRenderer = memo(({ part, isExpanded, onToggle }) => {
  // Parse arguments to get file info
  const fileInfo = useMemo(() => {
    if (!part?.arguments) return null;
    
    try {
      const args = typeof part.arguments === 'string' 
        ? JSON.parse(part.arguments) 
        : part.arguments;
      
      const filepath = args.file_path || args.target_file || args.path || 'unknown';
      const offset = args.offset || null;
      const limit = args.limit || null;
      
      return {
        filepath,
        offset,
        limit,
        hasRange: offset !== null || limit !== null,
      };
    } catch (err) {
      console.error('Failed to parse read_file arguments:', err);
      return null;
    }
  }, [part?.arguments]);

  if (!fileInfo || !isExpanded) {
    return null;
  }

  return (
    <div className="px-3 pb-2 pt-0.5">
      <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 font-mono">
        <Icon icon="mdi:file-document-outline" className="text-sm flex-shrink-0" />
        <span className="truncate">{fileInfo.filepath}</span>
        
        {fileInfo.hasRange && (
          <span className="text-xs opacity-60 ml-auto flex-shrink-0">
            {fileInfo.offset !== null && `offset: ${fileInfo.offset}`}
            {fileInfo.offset !== null && fileInfo.limit !== null && ', '}
            {fileInfo.limit !== null && `limit: ${fileInfo.limit}`}
          </span>
        )}
      </div>
    </div>
  );
});

ReadFileRenderer.displayName = 'ReadFileRenderer';

export default ReadFileRenderer;

