import React from 'react';
import { FileIcon, XIcon } from './icons';

export interface FileAttachment {
  file_name: string;
  mime_type: string;
  preview?: string;
  url?: string;
}

interface FilePreviewProps {
  files: FileAttachment[];
  onRemove: (index: number) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200/30 dark:border-gray-700/30">
      {files.map((file, index) => {
        const isImage = file.mime_type.startsWith('image/');
        return (
          <div key={index} className="relative group">
            {isImage ? (
              <img
                src={file.preview}
                alt={file.file_name}
                className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-2">
                <FileIcon />
                <span className="text-[8px] text-gray-600 dark:text-gray-400 mt-1 truncate w-full text-center">
                  {file.file_name.split('.').pop()?.toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => onRemove(index)}
              className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
            >
              <XIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
};

