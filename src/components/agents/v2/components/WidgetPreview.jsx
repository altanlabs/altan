import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

const WidgetPreview = memo(({ agentData, onConfigureWidget }) => {
  if (!agentData?.widget && !agentData?.id) {
    return (
      <Box
        sx={{
          height: '100%',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{ fontSize: '4rem', mb: 2 }}
          >
            🎛️
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Configure your widget to see the preview
          </Typography>
          <Button
            onClick={onConfigureWidget}
            variant="contained"
            size="small"
          >
            Configure Widget
          </Button>
        </Box>
      </Box>
    );
  }

  // Generate a clean widget preview with just the script
  const widgetPreviewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Widget Preview</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: #f5f5f5;
          min-height: 100vh;
          position: relative;
        }
      </style>
    </head>
    <body>
      <!-- Real Widget Script -->
      <script src="https://dashboard.altan.ai/altan-voice-widget.js" altan-agent-id="${agentData.id}"></script>
    </body>
    </html>
  `;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <iframe
        srcDoc={widgetPreviewHtml}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Live Widget Preview"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </Box>
  );
});

WidgetPreview.displayName = 'WidgetPreview';
WidgetPreview.propTypes = {
  agentData: PropTypes.object,
  onConfigureWidget: PropTypes.func.isRequired,
};

export default WidgetPreview; 