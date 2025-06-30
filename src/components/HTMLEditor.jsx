import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { Box, IconButton, Dialog, DialogContent, Typography, Stack, Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useCallback, lazy, Suspense } from 'react';

const AceEditor = lazy(() => {
  return Promise.all([
    import('ace-builds/src-noconflict/ace'),
    import('ace-builds/src-noconflict/theme-solarized_dark'),
    import('ace-builds/src-noconflict/theme-github'),
    import('ace-builds/src-noconflict/mode-html'),
    import('react-ace'),
  ]).then(([, , , , ace]) => ace);
});

const HTMLEditor = ({ value = '', onChange = null }) => {
  const [text, updateText] = useState(value);
  const [open, setOpen] = useState(false);

  const handleTextChange = useCallback(
    (newText) => {
      updateText(newText);
      if (onChange) {
        onChange(newText);
      }
    },
    [onChange],
  );

  const toggleDialog = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const renderAceEditor = useCallback(
    (editorProps = {}) => (
      <Suspense fallback={<div>Loading editor...</div>}>
        <AceEditor
          mode="html"
          theme="solarized_dark"
          value={text}
          onChange={handleTextChange}
          name="html-editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{ maxLines: Infinity }}
          width="100%"
          fontSize={14}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          {...editorProps}
        />
      </Suspense>
    ),
    [text, handleTextChange],
  );

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h6">HTML Editor</Typography>
        <Button
          onClick={toggleDialog}
          startIcon={<FullscreenIcon />}
        >
          Open editor
        </Button>
      </Stack>
      {renderAceEditor()}
      <iframe
        title="Webview"
        style={{ width: '100%', height: 500, marginTop: 20, border: 'none' }}
        srcDoc={text}
      />
      <Dialog
        fullScreen
        open={open}
        onClose={toggleDialog}
      >
        <DialogContent sx={{ padding: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ padding: 2 }}
          >
            <Typography variant="h6">HTML Editor</Typography>
            <IconButton onClick={toggleDialog}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Box sx={{ display: 'flex', height: 'calc(100% - 64px)' }}>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {renderAceEditor({
                name: 'html-editor-dialog',
                style: { height: '100%' },
              })}
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <iframe
                title="Webview"
                style={{ width: '100%', height: '100%', border: 'none' }}
                srcDoc={text}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

HTMLEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default HTMLEditor;
