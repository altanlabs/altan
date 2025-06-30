import { memo } from 'react';

import Iconify from '../../../../../components/iconify';

// Get icon based on file extension
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const fullName = fileName.toLowerCase();
  
  // Special files by full name
  const specialFiles = {
    'package.json': 'vscode-icons:file-type-npm',
    'tsconfig.json': 'vscode-icons:file-type-tsconfig',
    'tailwind.config.js': 'vscode-icons:file-type-tailwind',
    'postcss.config.js': 'vscode-icons:file-type-postcss',
    'vite.config.js': 'vscode-icons:file-type-vite',
    'vite.config.ts': 'vscode-icons:file-type-vite',
    '.gitignore': 'vscode-icons:file-type-git',
    '.env': 'vscode-icons:file-type-env',
    'dockerfile': 'vscode-icons:file-type-docker',
    'readme.md': 'vscode-icons:file-type-readme',
  };

  if (specialFiles[fullName]) {
    return specialFiles[fullName];
  }

  // File extensions
  const iconMap = {
    // JavaScript/TypeScript
    js: 'vscode-icons:file-type-js',
    jsx: 'vscode-icons:file-type-reactjs',
    ts: 'vscode-icons:file-type-typescript',
    tsx: 'vscode-icons:file-type-reactts',
    
    // Styles
    css: 'vscode-icons:file-type-css',
    scss: 'vscode-icons:file-type-scss',
    
    // Markup
    html: 'vscode-icons:file-type-html',
    svg: 'vscode-icons:file-type-svg',
    
    // Data
    json: 'vscode-icons:file-type-json',
    yaml: 'vscode-icons:file-type-yaml',
    yml: 'vscode-icons:file-type-yaml',
    
    // Documentation
    md: 'vscode-icons:file-type-markdown',
    txt: 'vscode-icons:file-type-text',
    
    // Images
    png: 'vscode-icons:file-type-image',
    jpg: 'vscode-icons:file-type-image',
    jpeg: 'vscode-icons:file-type-image',
    gif: 'vscode-icons:file-type-image',
    ico: 'vscode-icons:file-type-favicon',
  };
  
  return iconMap[ext] || 'vscode-icons:default-file';
};

const FileIcon = ({ fileName, ...other }) => {
  return (
    <Iconify
      icon={getFileIcon(fileName)}
      {...other}
    />
  );
};

export default memo(FileIcon);
