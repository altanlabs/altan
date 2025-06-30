// src/features/codeEditor/components/UnsavedChangesDialog.jsx

import PropTypes from 'prop-types';
import React, { memo } from 'react';

import Iconify from '../../../../../components/iconify';

const UnsavedChangesDialog = ({ fileName, onSave, onDontSave, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
      </div>

      {/* Dialog content */}
      <div className="relative z-10 w-[360px] max-w-full rounded-2xl shadow-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Iconify
            icon="mdi:alert-circle-outline"
            className="w-6 h-6 text-yellow-500 mt-0.5"
          />
          <h2 className="text-sm text-gray-800 dark:text-gray-100 font-medium leading-snug">
            Do you want to save the changes you made to{' '}
            <strong className="font-semibold dark:text-white">{fileName}</strong>?
          </h2>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
          Your changes will be lost if you don’t save them.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Save
          </button>
          <button
            onClick={onDontSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition"
          >
            Don’t Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

UnsavedChangesDialog.propTypes = {
  fileName: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onDontSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default memo(UnsavedChangesDialog);
