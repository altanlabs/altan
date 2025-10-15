// src/features/codeEditor/components/FileToolbar.jsx

import PropTypes from 'prop-types';
import React, { memo, useState, useCallback } from 'react';

import { cn } from '@lib/utils';

import FileIcon from './FileIcon';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import Iconify from '../../../../../components/iconify';
import {
  openFile,
  closeFile,
  saveFile,
  selectOpenFiles,
  selectActiveFile,
  selectFilesUnsavedChanges,
} from '../../../../../redux/slices/codeEditor';
import { dispatch, useSelector } from '../../../../../redux/store';

const FileToolbar = ({ interfaceId }) => {
  const openFiles = useSelector(selectOpenFiles);
  const activeFile = useSelector(selectActiveFile);

  // We store which file is about to be closed and needs a confirmation dialog
  const [fileToConfirmClose, setFileToConfirmClose] = useState(null);
  const unsavedChanges = useSelector(selectFilesUnsavedChanges);
  // Modal state for the file name that we display in the dialog
  const [fileDisplayName, setFileDisplayName] = useState('');

  // Check if a file has unsaved changes
  const hasUnsavedChangesFor = useCallback(
    (file) => Boolean(unsavedChanges?.[file]),
    [unsavedChanges],
  );

  const handleTabClick = (file) => {
    if (file !== activeFile) {
      dispatch(openFile(file, interfaceId));
    }
  };

  // Called when the user tries to close a file tab
  const handleCloseClick = (file, e) => {
    e.stopPropagation(); // Prevent triggering tab click
    const hasUnsaved = hasUnsavedChangesFor(file);
    if (hasUnsaved) {
      // Show the unsaved changes dialog
      setFileToConfirmClose(file);
      setFileDisplayName(file.split('/').pop()); // show just the file name
    } else {
      // No unsaved changes, close immediately
      dispatch(closeFile(file));
    }
  };

  // Handler for "Save" in the confirmation dialog
  const handleConfirmSave = async () => {
    if (fileToConfirmClose) {
      // In a real app, you might need to retrieve the file content from an editor ref
      // or from Redux state. For now, we pass an empty string or the known content.
      // Adjust as needed.
      await dispatch(saveFile(interfaceId, fileToConfirmClose, ''));
      dispatch(closeFile(fileToConfirmClose));
      setFileToConfirmClose(null);
    }
  };

  // Handler for "Don't Save" in the confirmation dialog
  const handleDontSave = () => {
    if (fileToConfirmClose) {
      dispatch(closeFile(fileToConfirmClose));
      setFileToConfirmClose(null);
    }
  };

  // Handler for "Cancel" in the confirmation dialog
  const handleCancel = () => {
    setFileToConfirmClose(null);
  };

  if (!openFiles?.length) {
    return null;
  }

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <div className="flex w-full min-w-0 bg-white dark:bg-[#1d1d1d] border-b border-gray-200 dark:border-[#404040] h-8 pl-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {openFiles.map((file) => {
          const fileName = file.split('/').pop();
          const isActive = file === activeFile;
          const hasUnsaved = hasUnsavedChangesFor(file);

          return (
            <div
              key={file}
              onClick={() => handleTabClick(file)}
              className={cn(
                'group/tab relative flex items-center space-x-1 h-full px-3 py-1 text-sm',
                'flex-shrink-0 min-w-[80px] max-w-[200px]',
                'border-r border-gray-300 dark:border-gray-600',
                isActive
                  ? 'bg-gray-100 dark:bg-gray-900 border-t border-blue-200 dark:border-blue-500'
                  : 'bg-transparent',
                'hover:bg-gray-200 dark:hover:bg-gray-800',
                'cursor-pointer select-none transition-colors',
              )}
            >
              <FileIcon
                fileName={fileName}
                width={12}
                style={{ color: 'inherit' }}
              />
              {/* Filename with unsaved indicator */}
              <span className="truncate pl-1 text-gray-900 dark:text-gray-200">
                {fileName}
                {hasUnsaved && (
                  <span className="text-orange-500 dark:text-orange-400 font-semibold ml-1">
                    *
                  </span>
                )}
              </span>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseClick(file, e);
                }}
                className={cn(
                  'ml-2 text-gray-400 dark:text-gray-400 hover:text-black dark:hover:text-white',
                  'transition-opacity',
                  isActive || hasUnsaved
                    ? 'opacity-100'
                    : 'opacity-0 group-hover/tab:opacity-100',
                )}
              >
                <Iconify
                  icon="mdi:close"
                  width={12}
                />
              </button>
            </div>
          );
        })}

        {/* Confirmation dialog if a file with unsaved changes is being closed */}
      </div>
      {fileToConfirmClose && (
        <UnsavedChangesDialog
          fileName={fileDisplayName}
          onSave={handleConfirmSave}
          onDontSave={handleDontSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

FileToolbar.propTypes = {
  interfaceId: PropTypes.string.isRequired,
};

export default memo(FileToolbar);
