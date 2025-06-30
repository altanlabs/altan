import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import { toPng } from 'html-to-image';
import React, { useRef, useState } from 'react';
import QRCode from 'react-qr-code';

import Iconify from './iconify/Iconify';

const QRCodeDialog = ({ link, open, onClose }) => {
  const qrCodeRef = useRef(null);
  const [iframeCode, setIframeCode] = useState(
    `<iframe src="${link}" width="100%" height="100%" frameborder="0"></iframe>`,
  );

  const handleCopyText = (text, message) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(message);
    });
  };

  const handleCopyImage = () => {
    if (qrCodeRef.current) {
      toPng(qrCodeRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'qrcode.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error('Failed to copy image:', error);
        });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>Share Form</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">Copy link:</Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            value={link}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleCopyText(link, 'Link copied to clipboard!')}>
                    <Iconify icon="mdi:content-copy" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Embed Code:</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={iframeCode}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleCopyText(iframeCode, 'Iframe code copied to clipboard!')}
                  >
                    <Iconify icon="mdi:content-copy" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">QR Code:</Typography>

          <div
            ref={qrCodeRef}
            style={{ textAlign: 'center', background: 'white', padding: '16px' }}
          >
            <QRCode
              value={link}
              size={256}
            />
          </div>
        </Box>

        <Button
          fullWidth
          onClick={handleCopyImage}
          color="primary"
          sx={{ pb: 4 }}
        >
          Download QR
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
