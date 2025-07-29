import { useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Iconify from './iconify/Iconify.jsx';
import CustomDialog from './dialogs/CustomDialog.jsx';

const MermaidDiagram = ({ chart, className = '' }) => {
  const theme = useTheme();
  const mermaidRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [mermaid, setMermaid] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaidInstance } = await import('mermaid');
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
          themeVariables: {
            primaryColor: theme.palette.primary.main,
            primaryTextColor: theme.palette.text.primary,
            primaryBorderColor: theme.palette.divider,
            lineColor: theme.palette.divider,
            sectionBkgColor: theme.palette.background.paper,
            altSectionBkgColor: theme.palette.background.default,
            gridColor: theme.palette.divider,
            secondaryColor: theme.palette.secondary.main,
            tertiaryColor: theme.palette.grey[100],
          },
          fontFamily: theme.typography.fontFamily,
          fontSize: 14,
          logLevel: 'fatal',
          securityLevel: 'loose',
        });
        if (!cancelled) setMermaid(mermaidInstance);
      } catch {
        if (!cancelled) {
          setError('Failed to load Mermaid');
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [theme]);

  const renderDiagram = useCallback(async () => {
    if (!chart || !mermaid) return;
    setIsLoading(true);
    setError(null);
    try {
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
      setSvgContent(svg);
      setIsLoading(false);
    } catch (e) {
      setError(e.message || 'Render error');
      setIsLoading(false);
    }
  }, [chart, mermaid]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  // Return null if loading or error
  if (isLoading || error) {
    return null;
  }

  const handleFullscreenToggle = () => setIsFullscreen((v) => !v);

  const handleDownload = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mermaid-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (navigator.clipboard && svgContent) navigator.clipboard.writeText(svgContent);
  };

  const DiagramBox = ({ fullscreen = false }) => (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: fullscreen ? '100%' : 'auto',
        minHeight: fullscreen ? '100%' : 200,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        '&:hover .mermaid-controls': { opacity: 1 },
      }}
    >
      <Box
        className="mermaid-controls"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 0.5,
          opacity: 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Tooltip title="Download SVG">
          <IconButton
            size="small"
            onClick={handleDownload}
            disabled={!svgContent}
          >
            <Iconify
              icon="eva:download-outline"
              width={16}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy SVG">
          <IconButton
            size="small"
            onClick={handleCopy}
            disabled={!svgContent}
          >
            <Iconify
              icon="eva:copy-outline"
              width={16}
            />
          </IconButton>
        </Tooltip>
        {!fullscreen && (
          <Tooltip title="Fullscreen">
            <IconButton
              size="small"
              onClick={handleFullscreenToggle}
            >
              <Iconify
                icon="eva:expand-outline"
                width={16}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          overflow: 'auto',
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={32} />
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Rendering diagram...
            </Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ textAlign: 'center', color: 'error.main', p: 2 }}>
            <Iconify
              icon="eva:alert-triangle-outline"
              width={24}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2">Failed to render diagram</Typography>
            <Typography
              variant="caption"
              sx={{ mt: 1, display: 'block' }}
            >
              {error}
            </Typography>
          </Box>
        )}
        {!isLoading && !error && (
          <Box
            ref={mermaidRef}
            sx={{ width: '100%', '& svg': { width: '100%', height: 'auto', display: 'block' } }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box className={className}>
        <DiagramBox />
      </Box>
      <CustomDialog
        dialogOpen={isFullscreen}
        onClose={handleFullscreenToggle}
        maxWidth={false}
        fullWidth
        PaperProps={{ sx: { width: '95vw', height: '95vh', maxWidth: '95vw', maxHeight: '95vh' } }}
      >
        <DialogContent sx={{ p: 0, height: '100%', width: '100%' }}>
          <DiagramBox fullscreen />
        </DialogContent>
      </CustomDialog>
    </>
  );
};

export default MermaidDiagram;
