import { memo } from 'react';

import Iconify from '../../../../../components/iconify';

// Get icon based on file extension - minimal monochrome icons
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const fullName = fileName.toLowerCase();
  
  // Special files by full name
  const specialFiles = {
    'package.json': 'mdi:package-variant',
    'tsconfig.json': 'mdi:language-typescript',
    '.gitignore': 'mdi:git',
    '.env': 'mdi:key-variant',
    'readme.md': 'mdi:information-outline',
  };

  if (specialFiles[fullName]) {
    return specialFiles[fullName];
  }

  // File extensions - using minimal monochrome icons
  const iconMap = {
    // JavaScript/TypeScript
    js: 'mdi:language-javascript',
    jsx: 'mdi:react',
    ts: 'mdi:language-typescript',
    tsx: 'mdi:react',
    
    // Styles
    css: 'mdi:language-css3',
    scss: 'mdi:sass',
    
    // Markup
    html: 'mdi:language-html5',
    svg: 'mdi:svg',
    
    // Data
    json: 'mdi:code-json',
    yaml: 'mdi:code-braces',
    yml: 'mdi:code-braces',
    
    // Documentation
    md: 'mdi:language-markdown',
    txt: 'mdi:text-box-outline',
    
    // Images
    png: 'mdi:file-image-outline',
    jpg: 'mdi:file-image-outline',
    jpeg: 'mdi:file-image-outline',
    gif: 'mdi:file-image-outline',
    ico: 'mdi:image-outline',
  };
  
  return iconMap[ext] || 'mdi:file-document-outline';
};

const FileIcon = ({ fileName, className = '', ...other }) => {
  return (
    <Iconify
      icon={getFileIcon(fileName)}
      className={`text-gray-500 dark:text-gray-500 ${className}`}
      {...other}
    />
  );
};

export default memo(FileIcon);
