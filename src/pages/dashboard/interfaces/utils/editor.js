// Helper function to check if a file is binary/non-text
const isBinaryFile = (path) => {
  const binaryExtensions = new Set([
    'png',
    'jpg',
    'jpeg',
    'gif',
    'ico',
    'svg',
    'webp',
    'mp3',
    'mp4',
    'wav',
    'ogg',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'zip',
    'tar',
    'gz',
    'rar',
    '7z',
    'ttf',
    'woff',
    'woff2',
    'eot',
    'exe',
    'dll',
    'so',
    'dylib',
  ]);
  const ext = path.split('.').pop().toLowerCase();
  return binaryExtensions.has(ext);
};

const languageMap = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  css: 'css',
  html: 'html',
  json: 'json',
  md: 'markdown',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  h: 'c',
  hpp: 'cpp',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
};

const getLanguage = (path) => {
  const ext = path.split('.').pop().toLowerCase();
  return languageMap[ext] || 'plaintext';
};

export { getLanguage, isBinaryFile };
