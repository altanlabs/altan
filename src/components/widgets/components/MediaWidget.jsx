import { Chip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import RenderPreview from './extra/RenderPreview.tsx';
import { optimai } from '../../utils/axios';

const MediaWidget = ({ id, name }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      if (!file && !isLoading && !hasError) {
        setIsLoading(true);
        try {
          const response = await optimai.get(`/media/${id}`, {
            responseType: 'blob',
          });
          const url = URL.createObjectURL(response.data);
          setFile({ url, type: response.headers['content-type'], name });
          setHasError(false);
        } catch (error) {
          console.error('Failed to fetch file:', error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFile();
  }, [id, file, isLoading, hasError]);

  if (hasError) {
    return <Typography color="error" sx={{ py: 1 }}>404 Media not found</Typography>;
  }

  if (isLoading || !file) {
    return <Chip key={id} label={name} />;
  }

  return <RenderPreview file={file} />;
};

export default MediaWidget;
