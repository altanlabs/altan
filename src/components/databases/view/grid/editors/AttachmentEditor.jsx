import { IconButton } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import Iconify from '../../../../iconify';

const FilePreview = ({ file, onRemove }) => {
  if (!file) return null;

  // Handle image previews
  if (file.mime_type?.startsWith('image/')) {
    return (
      <div className="relative group">
        <div className="w-16 h-16 overflow-hidden rounded border border-gray-200 relative">
          <img
            src={file.url || `data:${file.mime_type};base64,${file.file_content}`}
            alt={file.file_name}
            className="w-full h-full object-cover"
          />
        </div>
        {onRemove && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 z-50">
            <IconButton
              size="small"
              className="bg-white shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file);
              }}
            >
              <Iconify
                icon="mdi:close"
                className="w-4 h-4"
              />
            </IconButton>
          </div>
        )}
      </div>
    );
  }

  // For other file types, show an icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('video/')) return 'mdi:video';
    if (mimeType?.startsWith('audio/')) return 'mdi:music';
    if (mimeType === 'application/pdf') return 'mdi:file-pdf-box';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel'))
      return 'mdi:file-excel-box';
    if (mimeType?.includes('document') || mimeType?.includes('word')) return 'mdi:file-word-box';
    return 'mdi:file-document-outline';
  };

  return (
    <div className="relative group">
      <div className="w-16 h-16 border border-gray-200 rounded flex flex-col items-center justify-center relative">
        <Iconify
          icon={getFileIcon(file.mime_type)}
          className="w-8 h-8 text-gray-500"
        />
        <div className="text-xs text-gray-500 truncate max-w-full px-1">{file.file_name}</div>
      </div>
      {onRemove && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 z-50">
          <IconButton
            size="small"
            className="bg-white shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file);
            }}
          >
            <Iconify
              color="red"
              icon="mdi:close"
              className="w-4 h-4"
            />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState(props.value || []);

  useImperativeHandle(ref, () => ({
    getValue() {
      return files;
    },
    isPopup() {
      return true;
    },
    getPopupPosition() {
      return 'under';
    },
  }));

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file_name: file.name,
              mime_type: file.type,
              file_content: reader.result.split(',')[1], // Get base64 content without data URL prefix
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      }),
    );

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
  };

  const handleRemoveFile = (fileToRemove) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);
  };

  const handleSave = () => {
    props.onValueChange(files);
    props.stopEditing();
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
      style={{ width: '400px' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Attachments</h3>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Files
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
        {files.map((file, index) => (
          <FilePreview
            key={index}
            file={file}
            onRemove={handleRemoveFile}
          />
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Iconify
            icon="mdi:cloud-upload"
            className="w-12 h-12 mx-auto mb-2"
          />
          <p className="text-sm">Drop files here or click to upload</p>
        </div>
      )}
    </div>
  );
});
