import { Tooltip } from '@mui/material';

import Iconify from '../../../../iconify';
import AttachmentEditor from '../editors/AttachmentEditor';

const FilePreview = ({ file }) => {
  if (!file) return null;

  const handleClick = (e) => {
    if (file.url) {
      e.stopPropagation();
      window.open(file.url, '_blank');
    }
  };

  // Handle image previews
  if (file.mime_type?.startsWith('image/')) {
    return (
      <img
        src={file.url || `data:${file.mime_type};base64,${file.file_content}`}
        alt={file.file_name}
        className="w-8 h-8 object-cover rounded cursor-pointer"
        onClick={handleClick}
      />
    );
  }

  // For other file types, show an icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return { icon: 'mdi:image', color: '#00C853' };
    if (mimeType?.startsWith('video/')) return { icon: 'mdi:video', color: '#FF3D00' };
    if (mimeType?.startsWith('audio/')) return { icon: 'mdi:music', color: '#6200EA' };
    if (mimeType === 'application/pdf') return { icon: 'mdi:file-pdf-box', color: '#FF1744' };
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel'))
      return { icon: 'mdi:file-excel-box', color: '#2E7D32' };
    if (mimeType?.includes('document') || mimeType?.includes('word'))
      return { icon: 'mdi:file-word-box', color: '#1565C0' };
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint'))
      return { icon: 'mdi:file-powerpoint-box', color: '#C62828' };
    if (mimeType?.includes('zip') || mimeType?.includes('compressed'))
      return { icon: 'mdi:folder-zip', color: '#6D4C41' };
    return { icon: 'mdi:file-document-outline', color: '#757575' };
  };

  const fileIcon = getFileIcon(file.mime_type);
  return (
    <Iconify
      icon={fileIcon.icon}
      className={`w-6 h-6 ${file.url ? 'cursor-pointer' : ''}`}
      sx={{ color: fileIcon.color }}
      onClick={(e) => {
        if (file.url) {
          e.stopPropagation();
          window.open(file.url, '_blank');
        }
      }}
    />
  );
};

export const getAttachmentColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  field: field.db_field_name,
  headerName: field.name,
  editable: true,
  cellEditor: AttachmentEditor,
  width: 200,
  cellRenderer: (params) => {
    const files = params.value || [];
    if (!Array.isArray(files) || files.length === 0) return null;

    return (
      <div className="flex items-center gap-2 h-full">
        <div className="flex -space-x-1">
          {files.slice(0, 3).map((file, index) => (
            <Tooltip
              key={file.id || index}
              title={file.file_name}
            >
              <div className="border-2 border-white dark:border-gray-800 rounded">
                <FilePreview file={file} />
              </div>
            </Tooltip>
          ))}
        </div>

        {files.length > 3 && <span className="text-sm text-gray-500">+{files.length - 3}</span>}

        <div className="flex-grow" />
      </div>
    );
  },
  headerComponent: (params) => {
    const IconComponent = field.icon;
    return (
      <div className="flex items-center gap-2">
        <IconComponent
          fontSize="small"
          sx={{ opacity: 0.7 }}
        />
        <span>{params.displayName}</span>
      </div>
    );
  },
  mainMenuItems: (params) => getCommonFieldMenuItems(field, params),
});
