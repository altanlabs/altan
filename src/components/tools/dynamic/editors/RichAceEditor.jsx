import Editor from '@monaco-editor/react';
import {
  useTheme,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material';
import { memo, useState, useCallback } from 'react';

import Iconify from '../../../iconify/Iconify.jsx';

const RichAceEditor = ({ fieldKey, mode, value, onChange }) => {
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === 'light' ? 'light' : 'vs-dark';
  const [open, setOpen] = useState(false);

  const handleClickOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleCopy = useCallback(() => navigator.clipboard.writeText(value), [value]);

  // Map Ace modes to Monaco language IDs
  const getMonacoLanguage = (aceMode) => {
    const modeMap = {
      markdown: 'markdown',
      python: 'python',
      java: 'java',
      jsx: 'javascript',
      javascript: 'javascript',
      json: 'json',
    };
    return modeMap[aceMode] || 'plaintext';
  };

  const renderMonacoEditor = useCallback(
    (editorProps = {}) => (
      <Editor
        height={editorProps.height || '100%'}
        defaultLanguage={getMonacoLanguage(mode)}
        defaultValue={value || ''}
        theme={monacoTheme}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          alwaysConsumeMouseWheel: false,
          lineNumbers: 'on',
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          wrappingStrategy: 'advanced',
          automaticLayout: true,
          ...editorProps.options,
        }}
        loading={`Loading ${fieldKey} editor...`}
      />
    ),
    [mode, monacoTheme, onChange, value, fieldKey],
  );

  return (
    <>
      <Stack width="100%" height="100%" sx={{ minHeight: '400px' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
          sx={{ flexShrink: 0 }}
        >
          <Typography variant="subtitle2">{mode.toUpperCase()}</Typography>
          <Stack
            direction="row"
            spacing={1}
          >
            <Tooltip title="Ask AI">
              <IconButton
                size="small"
                onClick={() => alert('Ask functionality not implemented yet.')}
              >
                <Iconify icon="material-symbols-light:reply" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy">
              <IconButton
                size="small"
                onClick={handleCopy}
              >
                <Iconify icon="solar:copy-bold-duotone" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Expand">
              <IconButton
                size="small"
                onClick={handleClickOpen}
              >
                <Iconify icon="ion:expand-outline" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <div style={{ flex: 1, minHeight: '350px' }}>
          {renderMonacoEditor()}
        </div>
      </Stack>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
      >
        <DialogTitle
          sx={{
            p: 1,
            minHeight: '48px',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1">Code Editor</Typography>
            <Button
              onClick={handleClose}
              color="primary"
              startIcon={<Iconify icon="ic:outline-close" />}
              size="small"
            >
              Close
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            height: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderMonacoEditor({
            height: 'calc(100vh - 48px)',
            options: {
              fontSize: 14,
              minimap: { enabled: true },
            },
          })}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(RichAceEditor);
