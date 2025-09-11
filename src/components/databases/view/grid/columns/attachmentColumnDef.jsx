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
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
        <img
          src={file.url || `data:${file.mime_type};base64,${file.file_content}`}
          alt={file.file_name}
          className="w-full h-full object-cover"
          onClick={handleClick}
        />
      </div>
    );
  }

  // For other file types, show an icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('video/')) return { icon: 'mdi:video', color: '#8B5CF6' };
    if (mimeType?.startsWith('audio/')) return { icon: 'mdi:music', color: '#10B981' };
    if (mimeType === 'application/pdf') return { icon: 'mdi:file-pdf-box', color: '#EF4444' };
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel'))
      return { icon: 'mdi:file-excel-box', color: '#059669' };
    if (mimeType?.includes('document') || mimeType?.includes('word'))
      return { icon: 'mdi:file-word-box', color: '#3B82F6' };
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint'))
      return { icon: 'mdi:file-powerpoint-box', color: '#F97316' };
    if (mimeType?.includes('zip') || mimeType?.includes('compressed'))
      return { icon: 'mdi:folder-zip', color: '#8B5CF6' };
    return { icon: 'mdi:file-document-outline', color: '#6B7280' };
  };

  const fileIcon = getFileIcon(file.mime_type);
  return (
    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center cursor-pointer">
      <Iconify
        icon={fileIcon.icon}
        className="w-6 h-6"
        sx={{ color: fileIcon.color }}
        onClick={(e) => {
          if (file.url) {
            e.stopPropagation();
            window.open(file.url, '_blank');
          }
        }}
      />
    </div>
  );
};

export const getAttachmentColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  field: field.db_field_name,
  headerName: field.name,
  editable: true,
  cellEditor: AttachmentEditor,
  width: 250,
  minWidth: 200,
  maxWidth: 350,
  resizable: true,
  sortable: false,
  filter: false,
  cellRenderer: (params) => {
    const files = params.value || [];
    if (!Array.isArray(files) || files.length === 0) {
      return (
        <div className="flex items-center justify-center h-full opacity-30">
          <Iconify
            icon="mdi:attachment"
            className="w-4 h-4 text-gray-400"
          />
        </div>
      );
    }

    // Calculate how many files we can show based on available width
    // With 40px previews + 4px gap, we can fit about 4-5 files in 250px width
    const maxVisibleFiles = Math.min(files.length, 4);

    return (
      <div className="flex items-center h-full px-2 py-1">
        <div className="flex items-center gap-1">
          {files.slice(0, maxVisibleFiles).map((file, index) => (
            <Tooltip
              key={file.id || index}
              title={`${file.file_name} (${file.mime_type || 'unknown'})`}
              placement="top"
              arrow
            >
              <div>
                <FilePreview file={file} />
              </div>
            </Tooltip>
          ))}
        </div>

        {files.length > maxVisibleFiles && (
          <Tooltip
            title={`${files.length - maxVisibleFiles} more files`}
            placement="top"
          >
            <div className="flex items-center justify-center w-10 h-10 ml-1 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 text-sm font-semibold text-white cursor-help shadow-lg">
              +{files.length - maxVisibleFiles}
            </div>
          </Tooltip>
        )}
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
