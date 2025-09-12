import {
  DialogContent,
  IconButton,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useRef, useState, useCallback } from 'react';

import CustomDialog from './dialogs/CustomDialog.jsx';
import Iconify from './iconify/Iconify.jsx';

const MermaidDiagram = ({ chart, className = '' }) => {
  const theme = useTheme();
  const mermaidRef = useRef(null);
  const lastRenderedChartRef = useRef('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [mermaid, setMermaid] = useState(null);
  const [isValidChart, setIsValidChart] = useState(false);
  const [lastValidChart, setLastValidChart] = useState('');
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);

  // Function to validate if the chart is complete and valid
  const validateChart = useCallback((chartText) => {
    if (!chartText || typeof chartText !== 'string') return false;

    // Basic validation - check if it starts with a valid mermaid diagram type
    const validStarters = [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'journey',
      'gantt',
      'pie',
      'gitgraph',
      'mindmap',
      'timeline',
      'sankey',
      'block',
    ];

    const trimmed = chartText.trim();
    const hasValidStart = validStarters.some((starter) =>
      trimmed.toLowerCase().startsWith(starter.toLowerCase()),
    );

    if (!hasValidStart) return false;

    // Check for basic completeness - should have at least some content after the declaration
    const lines = trimmed.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return false;

    // Check for balanced brackets/parentheses (basic syntax check)
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack = [];

    for (const char of trimmed) {
      if (Object.keys(brackets).includes(char)) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const lastOpen = stack.pop();
        if (!lastOpen || brackets[lastOpen] !== char) {
          return false;
        }
      }
    }

    // Allow some unbalanced brackets as the chart might still be being written
    // But if there are too many, it's likely incomplete
    return stack.length <= 3;
  }, []);

  // Effect to validate chart and update state
  useEffect(() => {
    const isValid = validateChart(chart);
    setIsValidChart(isValid);

    if (isValid && chart !== lastValidChart) {
      setLastValidChart(chart);
    }
  }, [chart, validateChart, lastValidChart]);

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
        if (!cancelled) {
          setMermaid(mermaidInstance);
          // Reset rendered chart ref when mermaid instance changes
          lastRenderedChartRef.current = '';
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load Mermaid');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [theme]);

  const renderDiagram = useCallback(async () => {
    if (!mermaid || !lastValidChart) return;

    // Don't render if we've already rendered this exact chart
    if (lastRenderedChartRef.current === lastValidChart) return;

    setIsRendering(true);
    setError(null);

    try {
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, lastValidChart);
      setSvgContent(svg);
      setHasRenderedOnce(true);
      lastRenderedChartRef.current = lastValidChart;
      setIsRendering(false);
    } catch (e) {
      setIsRendering(false);
      setError(e.message || 'Render error');
    }
  }, [lastValidChart, mermaid]);

  // Debounced rendering effect
  useEffect(() => {
    if (!isValidChart || !lastValidChart || !mermaid) return;

    // Don't trigger if we've already rendered this chart
    if (lastRenderedChartRef.current === lastValidChart) return;

    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 500); // 500ms debounce to avoid rapid re-renders

    return () => clearTimeout(timeoutId);
  }, [isValidChart, lastValidChart, mermaid, renderDiagram]);

  // Determine what to show
  const showSkeleton = !isValidChart && !hasRenderedOnce;
  const showDiagram = svgContent || hasRenderedOnce;
  const showError = error && !svgContent && !showSkeleton;

  // Return null if error and no content to show
  if (showError) {
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
        maxHeight: fullscreen ? '100%' : 350,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        '&:hover .mermaid-controls': { opacity: showDiagram ? 1 : 0 },
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
          minHeight: fullscreen ? '100%' : 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          overflow: 'auto',
          cursor: fullscreen ? 'default' : (showDiagram ? 'pointer' : 'default'),
        }}
        onClick={!fullscreen && showDiagram ? handleFullscreenToggle : undefined}
      >
        {/* Show skeleton content */}
        {showSkeleton && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {/* Animated skeleton shapes */}
            <Box
              sx={{
                width: '80%',
                height: '60%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'center',
              }}
            >
              {/* Top nodes */}
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 80,
                      height: 40,
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                      animation: 'pulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.4 },
                        '50%': { opacity: 0.8 },
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Connecting lines */}
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center' }}>
                {[1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 2,
                      height: 30,
                      backgroundColor: theme.palette.action.hover,
                      animation: 'pulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </Box>

              {/* Bottom nodes */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {[1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 100,
                      height: 40,
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                      animation: 'pulse 2s ease-in-out infinite',
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Loading indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Generating diagram...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Show error content */}
        {error && !svgContent && !showSkeleton && (
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

        {/* Show diagram content */}
        {svgContent && (
          <Box
            ref={mermaidRef}
            sx={{
              width: '100%',
              position: 'relative',
              '& svg': { width: '100%', height: 'auto', display: 'block' },
              opacity: isRendering ? 0.8 : 1,
              transition: 'opacity 0.2s ease',
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {/* Show updating indicator */}
        {isRendering && svgContent && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
            }}
          >
            <CircularProgress size={12} color="inherit" />
            <Typography variant="caption" color="inherit">
              Updating...
            </Typography>
          </Box>
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
