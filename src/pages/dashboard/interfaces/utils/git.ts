interface GitFile {
  path: string;
  original: string;
  modified: string;
}

function parseGitDiff(diffString: string): GitFile[] {
  const files: GitFile[] = [];
  const lines = diffString.split('\n');

  let currentFile: { path: string } | null = null;
  let original: string[] = [];
  let modified: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('diff --git')) {
      if (currentFile) {
        files.push({
          path: currentFile.path,
          original: original.join('\n'),
          modified: modified.join('\n')
        });
      }
      const parts = line.split(' ');
      // parts[2] is the old path, parts[3] is the new path
      const aPath = parts[2];
      const bPath = parts[3];
      currentFile = { path: bPath.replace(/^b\//, '') };
      original = [];
      modified = [];
    } else if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('index') || line.startsWith('@@')) {
      continue;
    } else if (line.startsWith('-')) {
      original.push(line.slice(1));
    } else if (line.startsWith('+')) {
      modified.push(line.slice(1));
    } else {
      original.push(line);
      modified.push(line);
    }
  }

  if (currentFile) {
    files.push({
      path: currentFile.path,
      original: original.join('\n'),
      modified: modified.join('\n')
    });
  }

  return files;
}
