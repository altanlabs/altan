import { Button, Stack, TextField } from '@mui/material';
import { saveAs } from 'file-saver';
import React, { memo, useState } from 'react';

const BlobDownloader = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('image.gif');
  const downloadBlob = async () => {
    try {
      const response = await fetch(url); // Replace with the actual blob URL
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      saveAs(blob, 'downloaded_image.gif'); // Replace with the desired file name
    } catch (error) {
      console.error('There was an error downloading the blob:', error);
    }
  };

  return (
    <Stack
      spacing={1}
      alignItems="center"
      jusitfyContent="center"
      width="100%"
      height="100%"
    >
      <TextField
        label="Url to download"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={downloadBlob}>Download Blob Image</Button>
    </Stack>
  );
};

export default memo(BlobDownloader);
