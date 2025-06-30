import { Tooltip, Popover, IconButton, Button } from '@mui/material';
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import ThreadStatus from './ThreadStatus.jsx';
import { deleteThread, patchThread } from '../../../redux/slices/room';
import Iconify from '../../iconify/Iconify.jsx';

const ThreadPopoverDetails = ({ thread, anchorEl, onClose }) => {
  const [status, setStatus] = useState({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    setStatus({ initial: thread?.status || 'running', current: thread?.status || 'running' });
    setName(thread?.name || '');
    setDescription(thread?.description || '');
  }, [thread]);

  const handleSave = () => {
    dispatch(patchThread({ threadId: thread.id, name, description, status: status.initial !== status.current ? status.current : undefined }));
    onClose();
  };

  const changeStatus = useCallback((newStatus) => {
    setStatus((prev) => ({ ...prev, current: newStatus }));
  }, []);

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      classes={{ paper: 'z-50 backdrop-blur-lg bg-white/75 dark:bg-black/75 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-[22rem]' }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'transparent',
          },
        },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thread Settings</h3>
          <Tooltip title="Copy Thread ID" arrow>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(thread.id);
              }}
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              size="small"
            >
              <Iconify icon="mdi:content-copy" className="w-4 h-4" />
            </IconButton>
          </Tooltip>
        </div>
        <Tooltip title="Delete Thread" arrow>
          <IconButton
            onClick={() => dispatch(deleteThread(thread.id))}
            className="text-red-500 hover:bg-red-100 dark:hover:bg-red-800"
          >
            <Iconify icon="ic:round-delete" className="w-5 h-5" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="thread-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              id="thread-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter thread name"
              className="block shadow-lg p-1 bg-transparent w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="thread-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <div className="relative mt-1">
            <textarea
              id="thread-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter thread description"
              rows={3}
              className="block shadow-lg p-1 bg-transparent w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-500 dark:focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Change Thread Status
          </label>
          <ThreadStatus status={status.current} setStatus={changeStatus} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end px-4 py-3 space-x-2 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outlined"
          onClick={onClose}
          className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Discard
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Save
        </Button>
      </div>
    </Popover>
  );
};

export default memo(ThreadPopoverDetails);
