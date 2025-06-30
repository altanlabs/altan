import { Card, CircularProgress, Stack, Typography, IconButton } from '@mui/material';
import React, { useCallback, useState, useEffect } from 'react';

import { uploadMedia } from '../utils/media';
import Iconify from './iconify/Iconify';
import useFeedbackDispatch from '../hooks/useFeedbackDispatch';
import { deleteMedia } from '../redux/slices/media';

function toTitleCase(str) {
  const result = str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}

const FileToUrl = ({ onChange, value, name }) => {
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  useEffect(() => {
    if (value && (value.includes('.jpg') || value.includes('.png') || value.includes('.gif'))) {
      setFilePreview(value);
    } else {
      setFilePreview(null);
    }
  }, [value]);

  const handleFileChange = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }

    const mediaUrl = await uploadMedia(file);
    if (mediaUrl) {
      onChange(mediaUrl);
    } else {
      console.error('Failed to upload file.');
    }
    setLoading(false);
  };

  const handleRemoveFile = useCallback(() => {
    console.log('REMOVING FILE...', value);

    const mediaIdMatch = value.match(
      /platform\/media\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/,
    );
    const mediaId = mediaIdMatch ? mediaIdMatch[1] : null;
    if (!mediaId) {
      onChange(null);
      console.error('Could not extract media ID from URL:', value);
      return;
    }

    dispatchWithFeedback(deleteMedia({ mediaId }), {
      successMessage: 'File deleted successfully',
      errorMessage: 'Error deleting file',
      useSnackbar: true,
      useConsole: true,
    })
      .then(() => {
        console.log(`Media with ID ${mediaId} deleted successfully.`);
        onChange(null);
      })
      .catch((error) => {});
  }, [dispatchWithFeedback, value]);

  return (
    <Card sx={{ p: 1 }}>
      <Stack spacing={1}>
        {/* <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Iconify icon="mdi:file" />
          {!!name && <Typography>{toTitleCase(name)}</Typography>}
        </Stack> */}

        {!value && (
          <input
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
        )}
        {loading && <CircularProgress size={20} />}
        {!!value && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <Typography variant="caption">{value}</Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={() => window.open(value, '_blank')}
            >
              <Iconify icon="mdi:eye" />
            </IconButton>
            <IconButton
              size="small"
              color="secondary"
              onClick={() => navigator.clipboard.writeText(value)}
            >
              <Iconify icon="mdi:content-copy" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={handleRemoveFile}
              disabled={loading}
            >
              <Iconify icon="mdi:delete" />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default FileToUrl;
