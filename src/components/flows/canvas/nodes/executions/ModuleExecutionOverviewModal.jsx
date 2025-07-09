import {
  Box,
  Typography,
  Stack,
  Slider,
  IconButton,
  LinearProgress,
  Chip,
  useTheme,
  Card,
  Tooltip,
  Grid,
  Button,
} from '@mui/material';
import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import {
  JsonView,
  collapseAllNested,
  defaultStyles,
  allExpanded,
  darkStyles,
} from 'react-json-view-lite';

import 'react-json-view-lite/dist/index.css';
import {
  clearModuleExecInMenu,
  selectCurrentExecutionModuleInMenu,
  selectModuleExecInMenu,
} from '../../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../../redux/store';
import { CardTitle } from '../../../../aceternity/cards/card-hover-effect.tsx';
import CustomDialog from '../../../../dialogs/CustomDialog.jsx';
import Iconify from '../../../../iconify';

const STATUS_COLOR_MAP = {
  start: '#3498db',
  success: '#2ecc71',
  error: '#e74c3c',
};

const onClose = () => dispatch(clearModuleExecInMenu());

async function fetchMediaMetadata(url) {
  try {
    new URL(url); // Validate URL format
  } catch {
    // console.error('Invalid URL:', url);
    throw new Error('Invalid URL format');
  }

  const metadata = {
    title: 'Unknown Title',
    fileType: 'unknown',
    size: 'Unknown size',
    url,
  };

  try {
    let response = await fetch(url, { method: 'HEAD' });

    // If HEAD fails with 405, try GET as a fallback
    if (response.status === 405) {
      // console.warn('HEAD method not allowed. Falling back to GET request.');
      response = await fetch(url, { method: 'GET' });
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    // console.log('Response headers:', [...response.headers]);

    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      metadata.fileType = contentType.split('/')[1] || 'unknown';
    } else {
      // console.warn('Content-Type header missing');
    }

    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      metadata.size = `${(contentLength / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      // console.warn('Content-Length header missing');
    }

    if (contentType?.startsWith('image/')) {
      const img = new Image();
      img.src = url;
      await img.decode();
      metadata.dimensions = `${img.width}x${img.height}`;
    }
  } catch (error) {
    // console.error('Error fetching metadata:', error.message);
    metadata.error = error.message;
  }
  return metadata;
}

const isMediaType = (fileType, types) => {
  return types.some((type) => fileType.includes(type));
};

const getFileIcon = (fileType) => {
  if (isMediaType(fileType, ['video'])) return <Iconify icon="mdi:video" />;
  if (isMediaType(fileType, ['image'])) return <Iconify icon="mdi:image" />;
  if (isMediaType(fileType, ['audio'])) return <Iconify icon="mdi:music-note" />;
  if (isMediaType(fileType, ['pdf'])) return <Iconify icon="mdi:file-pdf-box" />;
  if (isMediaType(fileType, ['excel'])) return <Iconify icon="mdi:file-excel-box" />;
  if (isMediaType(fileType, ['word'])) return <Iconify icon="mdi:file-word-box" />;
  if (isMediaType(fileType, ['powerpoint'])) return <Iconify icon="mdi:file-powerpoint-box" />;
  if (isMediaType(fileType, ['text', 'plain'])) return <Iconify icon="mdi:file-document-box" />;
  if (isMediaType(fileType, ['zip', 'compressed'])) return <Iconify icon="mdi:folder-zip" />;
  if (isMediaType(fileType, ['json', 'code'])) return <Iconify icon="mdi:file-code" />;
  return <Iconify icon="mdi:file-outline" />;
};

const MediaCard = memo(({ url }) => {
  const [metaData, setMetaData] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      const data = await fetchMediaMetadata(url);
      setMetaData(data);
    };
    if (!!url?.length) {
      fetchMetadata();
    }
  }, [url]);

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(url);
  }, [url]);

  const getCardStyles = () => {
    if (!metaData) return { minWidth: 40 };
    if (isMediaType(metaData.fileType, ['audio', 'mpeg', 'ogg', 'wav'])) {
      return { minWidth: 400 };
    }
    if (isMediaType(metaData.fileType, ['video', 'mp4', 'webm'])) {
      return { minWidth: 400, height: 'auto' };
    }
    return { width: '220px', height: 'auto' };
  };

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 1, ...getCardStyles() }}>
      {metaData && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
            {isMediaType(metaData.fileType, [
              'audio',
              'video',
              'image',
              'mpeg',
              'ogg',
              'wav',
              'mp4',
              'webm',
            ]) ? (
                  <></>
                ) : (
                  <>
                    {getFileIcon(metaData.fileType)}
                    <Typography
                      variant="body2"
                      sx={{ ml: 1 }}
                    >
                      {metaData.title}
                    </Typography>
                  </>
                )}
          </Box>
          {isMediaType(metaData.fileType, ['image']) && (
            <img
              src={url}
              alt="Media preview"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {isMediaType(metaData.fileType, ['audio', 'mpeg', 'ogg', 'wav']) && (
            <audio controls>
              <source src={url} />
              Your browser does not support the audio element.
            </audio>
          )}
          {isMediaType(metaData.fileType, ['video', 'mp4', 'webm']) && (
            <video
              controls
              style={{ width: '100%', height: 'auto', borderRadius: '5px', maxHeight: '150px' }}
            >
              <source src={url} />
              Your browser does not support the video element.
            </video>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, zIndex: 999 }}>
            <Tooltip title="Copy media URL">
              <IconButton
                onClick={handleCopyUrl}
                size="small"
                style={{ visibility: 'visible' }}
              >
                <Iconify icon="mdi:content-copy" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in a new tab">
              <IconButton
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                style={{ visibility: 'visible' }}
              >
                <Iconify icon="mdi:open-in-new" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Card>
  );
});

MediaCard.displayName = 'MediaCard';

const MediaAccordion = memo(({ mediaUrls }) => (
  <Grid
    container
    spacing={1}
  >
    {mediaUrls.map((url, index) => (
      <Grid
        item
        xs={6}
        key={index}
      >
        <MediaCard url={url} />
      </Grid>
    ))}
  </Grid>
));

MediaAccordion.displayName = 'MediaAccordion';

const getDataSize = (obj) => {
  return new TextEncoder().encode(JSON.stringify(obj)).length;
};

const separateRequestResponse = (data) => {
  if (!data || typeof data !== 'object') return { input: null, output: data };

  const findAndExtractStats = (obj) => {
    if (!obj || typeof obj !== 'object') return { stats: null, rest: obj };

    if (obj.__stats) {
      const { __stats, ...rest } = obj;
      return { stats: __stats, rest };
    }

    // Search nested objects for __stats
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        const { stats, rest } = findAndExtractStats(obj[key]);
        if (stats) {
          const newObj = { ...obj };
          delete newObj[key];
          return {
            stats,
            rest: { ...newObj, [key]: rest },
          };
        }
      }
    }

    return { stats: null, rest: obj };
  };

  const { stats, rest } = findAndExtractStats(data);
  return {
    input: stats,
    output: rest,
  };
};

const customJsonStyles = {
  light: {
    ...defaultStyles,
    container: '100%',
    body: { fontSize: '0.9rem' },
    string: { color: '#22863a' }, // Green for strings
    number: { color: '#005cc5' }, // Blue for numbers
    boolean: { color: '#e36209' }, // Orange for booleans
    null: { color: '#9932cc' }, // Purple for null
    key: { color: '#d73a49' }, // Red for keys
  },
  dark: {
    ...darkStyles,
    quotesForFieldNames: true,
    container: 'relative h-full -z-1 w-full text-sm rounded-lg',
    stringValue: 'text-[#95e8bd] break-words',
    numberValue: 'text-[#79b8ff]', // Light blue for numbers
    booleanValue: 'text-[#ffab70]', // Light orange for booleans
    nullValue: 'text-[#b392f0]', // Light purple for null
    undefinedValue: 'text-[#b392f0]', // Light purple for null
    label: 'text-[#ff7b72] pr-1 font-bold', // Light red for keys
  },
};

const extractMediaUrls = (data) => {
  const urls = [];
  const traverse = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key === '__stats') {
          continue; // Skip the __stats key
        }
        if (typeof obj[key] === 'string' && obj[key].startsWith('https://')) {
          urls.push(obj[key]);
        } else {
          traverse(obj[key]);
        }
      }
    }
  };
  traverse(data);
  return urls;
};

const ModuleExecutionsOverviewModal = () => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const open = useSelector(selectModuleExecInMenu);
  const moduleExecutions = useSelector(selectCurrentExecutionModuleInMenu);
  const [showMediaAccordion, setShowMediaAccordion] = useState(false);
  const toggleMediaAccordion = useCallback(() => setShowMediaAccordion((prev) => !prev), []);

  const executionStats = useMemo(() => {
    if (!moduleExecutions || !moduleExecutions.details) return { success: 0, error: 0, total: 0 };

    const stats = Object.values(moduleExecutions.details).reduce(
      (acc, execution) => {
        acc[execution.status] = (acc[execution.status] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { success: 0, error: 0, total: 0 },
    );

    return stats;
  }, [moduleExecutions]);

  const handleSliderChange = useCallback((event, newValue) => setCurrentIndex(newValue), []);

  const successPercentage = useMemo(
    () => (executionStats.success / executionStats.total) * 100,
    [executionStats.success, executionStats.total],
  );
  const errorPercentage = useMemo(
    () => (executionStats.error / executionStats.total) * 100,
    [executionStats.error, executionStats.total],
  );

  const executionArrayLength = useMemo(
    () => Object.keys(moduleExecutions?.details ?? {}).length,
    [moduleExecutions?.details],
  );

  const { executionStatus, content, global_vars } = useMemo(() => {
    if (!executionArrayLength) {
      return {};
    }
    const executionArray = Object.entries(moduleExecutions?.details ?? {});
    const [, currentExecution] = executionArray[currentIndex] || [];
    return {
      executionStatus: currentExecution?.status,
      content: currentExecution?.content,
      global_vars: currentExecution?.global_vars,
    };
  }, [currentIndex, executionArrayLength, moduleExecutions?.details]);

  const { input, output } = useMemo(() => {
    if (!executionArrayLength) return { input: null, output: null };

    const rawData =
      executionStatus === 'error'
        ? { error: content, global_vars }
        : content !== null
          ? { content, global_vars }
          : global_vars || {};
    return separateRequestResponse(rawData);
  }, [content, executionStatus, global_vars, executionArrayLength]);

  const mediaUrls = useMemo(() => extractMediaUrls(output), [output]);

  const expansionMode = useMemo(() => {
    const SIZE_THRESHOLD = 2 * 1024 * 1024; // 2MB in bytes
    return getDataSize(output) > SIZE_THRESHOLD ? collapseAllNested : allExpanded;
  }, [output]);

  if (!executionArrayLength) {
    return null;
  }

  return (
    <CustomDialog
      dialogOpen={Boolean(open)}
      onClose={onClose}
      fullWidth
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        className="sticky top-0 backdrop-blur-lg z-[100]"
        padding={2}
      >
        <CardTitle>Module Execution Details</CardTitle>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Box sx={{ width: 250, display: 'flex', alignItems: 'center' }}>
            <Chip
              size={successPercentage < errorPercentage ? 'large' : 'small'}
              sx={{ textAlign: 'right', mx: 1 }}
              label={`${Math.round(errorPercentage)}%`}
              color="error"
            />
            <LinearProgress
              variant="determinate"
              value={errorPercentage}
              sx={{
                width: 180,
                height: 10,
                borderRadius: 5,
                bgcolor: STATUS_COLOR_MAP.success,
                '& .MuiLinearProgress-bar': {
                  bgcolor: STATUS_COLOR_MAP.error,
                  borderRadius: 5,
                },
              }}
            />
            <Chip
              size={errorPercentage < successPercentage ? 'large' : 'small'}
              sx={{ textAlign: 'left', mx: 1 }}
              label={`${Math.round(successPercentage)}%`}
              color="success"
            />
          </Box>
        </Stack>

      </Stack>

      {executionArrayLength > 0 && (
        <>
          {moduleExecutions.total > 1 && (
            <Box sx={{ mb: 2 }}>
              <Slider
                value={currentIndex}
                onChange={handleSliderChange}
                min={0}
                max={executionArrayLength - 1}
                step={1}
                marks
                sx={{ color: STATUS_COLOR_MAP[executionStatus] }}
              />
            </Box>
          )}
          <Stack
            direction="row"
            spacing={1}
            paddingX={2}
            alignItems="center"
          >
            <Box
              sx={{
                background: STATUS_COLOR_MAP[executionStatus],
                height: 12,
                width: 12,
                borderRadius: '50%',
              }}
            />
            <Typography variant="subtitle1">
              {executionStatus &&
                `${executionStatus.charAt(0).toUpperCase() + executionStatus.slice(1)} (${currentIndex + 1}/${executionArrayLength})`}
            </Typography>
            {!!mediaUrls?.length && (
              <Button
                variant="soft"
                color="inherit"
                onClick={toggleMediaAccordion}
                startIcon={<Iconify icon={showMediaAccordion ? 'mdi:eye-off' : 'mdi:eye'} />}
                size="small"
              >
                {showMediaAccordion ? 'Hide external files' : 'Show external files'}
              </Button>
            )}
          </Stack>
        </>
      )}

      {showMediaAccordion && !!mediaUrls?.length && <MediaAccordion mediaUrls={mediaUrls} />}

      <div className="relative z-[99] p-2 w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
        {/* Input Card */}
        {input !== null && (
          <div className="h-full bg-white dark:bg-[#2A2A2A] rounded-lg shadow-md relative overflow-y-scroll">
            <div className="sticky top-0 w-full rounded-t-lg z-[99] backdrop-blur-lg p-2">
              <h6 className="text-lg font-bold">Input</h6>
              {/* <hr className="border-gray-200 dark:border-gray-700 mb-4" /> */}
            </div>
            <JsonView
              data={input}
              shouldExpandNode={expansionMode}
              style={theme.palette.mode === 'dark' ? customJsonStyles.dark : customJsonStyles.light}
            />
          </div>
        )}

        {/* Output Card */}
        <div className="bg-white dark:bg-[#2A2A2A] rounded-lg shadow-md h-full overflow-y-scroll">
          <div className="sticky top-0 w-full z-[99] rounded-t-lg backdrop-blur-lg p-2">
            <h6 className="text-lg font-bold mb-2">Output</h6>
          </div>
          <JsonView
            data={output || {}}
            shouldExpandNode={expansionMode}
            style={theme.palette.mode === 'dark' ? customJsonStyles.dark : customJsonStyles.light}
          />
        </div>
      </div>
    </CustomDialog>
  );
};

export default memo(ModuleExecutionsOverviewModal);
