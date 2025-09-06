import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import { useState, useCallback, useRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';

import Iconify from '../../iconify';

const ImportCSVDrawer = memo(({ open, onClose, onImport, tableName = 'table' }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);

  const processCSVFile = useCallback((csvFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('CSV file must have at least a header row and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const firstDataRow = lines[1].split(',').map(d => d.trim().replace(/"/g, ''));
        
        setPreviewData({
          headers,
          firstRow: firstDataRow,
          totalRows: lines.length - 1,
          fileName: csvFile.name,
          fileSize: (csvFile.size / 1024).toFixed(1) + ' KB'
        });
        setError(null);
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        setPreviewData(null);
      }
    };
    reader.readAsText(csvFile);
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const csvFile = acceptedFiles[0];
    if (csvFile) {
      setFile(csvFile);
      processCSVFile(csvFile);
    }
  }, [processCSVFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processCSVFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !previewData) return;
    
    setIsProcessing(true);
    try {
      // Call the import function passed from parent
      await onImport?.(file, previewData);
      // Reset state on success
      setFile(null);
      setPreviewData(null);
      setError(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFile(null);
      setPreviewData(null);
      setError(null);
      onClose();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Add data to {tableName}
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={isProcessing}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {/* Tab-like buttons */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '13px',
                borderRadius: 1.5,
              }}
            >
              Upload CSV
            </Button>
            <Button
              variant="text"
              size="small"
              disabled
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '13px',
                color: (theme) => theme.palette.text.disabled,
              }}
            >
              Paste text
            </Button>
          </Stack>

          {/* Instructions */}
          <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
            Upload a CSV or TSV file. The first row should be the headers of the table, and your headers should not include any special characters other than hyphens ( - ) or underscores ( _ ).
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '12px' }}>
            <strong>Tip:</strong> Datetime columns should be formatted as YYYY-MM-DD HH:mm:ss
          </Typography>

          {/* Drop Zone */}
          <Box
            {...getRootProps()}
            sx={{
              border: (theme) => `2px dashed ${
                isDragActive 
                  ? theme.palette.primary.main 
                  : isDragReject 
                    ? theme.palette.error.main 
                    : theme.palette.divider
              }`,
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: isDragActive 
                ? (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(25, 118, 210, 0.08)' 
                  : 'rgba(25, 118, 210, 0.04)'
                : 'transparent',
              '&:hover': {
                borderColor: (theme) => theme.palette.primary.main,
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.02)' 
                  : 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            <input {...getInputProps()} />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!file ? (
              <>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Drag and drop, or{' '}
                  <Typography
                    component="span"
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrowseFiles();
                    }}
                  >
                    browse
                  </Typography>{' '}
                  your files
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                  Supports CSV and TSV files up to 10MB
                </Typography>
              </>
            ) : (
              <Box>
                <Iconify
                  icon="mdi:file-check"
                  width={32}
                  height={32}
                  sx={{ color: 'success.main', mb: 1 }}
                />
                <Typography variant="body2" fontWeight={500}>
                  File ready for import
                </Typography>
              </Box>
            )}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* File Preview */}
          {previewData && !error && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  File Preview
                </Typography>
                <IconButton size="small" onClick={handleRemoveFile}>
                  <Iconify icon="mdi:close" width={16} />
                </IconButton>
              </Box>
              
              <Box
                sx={{
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ p: 2, backgroundColor: (theme) => theme.palette.grey[50] }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Iconify icon="mdi:file-outline" width={16} />
                    <Typography variant="body2" fontWeight={500}>
                      {previewData.fileName}
                    </Typography>
                    <Chip label={previewData.fileSize} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {previewData.totalRows} rows • {previewData.headers.length} columns
                  </Typography>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Headers ({previewData.headers.length}):
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {previewData.headers.map((header, index) => (
                      <Chip
                        key={index}
                        label={header}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '11px' }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Importing data...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 3,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button 
            variant="text" 
            onClick={handleClose}
            disabled={isProcessing}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!previewData || !!error || isProcessing}
            sx={{ textTransform: 'none' }}
          >
            Import data
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
});

ImportCSVDrawer.displayName = 'ImportCSVDrawer';

export default ImportCSVDrawer;
