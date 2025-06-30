import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { toPng } from 'html-to-image';
import React, { useRef } from 'react';
import QRCode from 'react-qr-code';

import Iconify from '../../../components/iconify/Iconify';

const ShareGate = ({ gateId, open, onClose }) => {
  const qrCodeRef = useRef(null);
  const link = `https://app.altan.ai/gate/${gateId}`;
  const snippetCode = `<script src="https://app.altan.ai/jssnippet/cbsnippet.js" async id="${gateId}"></script>`;

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
      maxWidth="sm"
    >
      <DialogTitle className="bg-gray-50 border-b">
        <Typography
          variant="h6"
          className="font-semibold"
        >
          Share Gate
        </Typography>
      </DialogTitle>
      <DialogContent className="space-y-6 pt-6">
        {/* Direct Link Section */}
        <div>
          <Typography
            variant="subtitle1"
            className="font-medium mb-2"
          >
            Direct Link
          </Typography>
          <TextField
            fullWidth
            size="small"
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
        </div>

        <Divider />

        {/* Embed Section */}
        <div>
          <Typography
            variant="subtitle1"
            className="font-medium mb-2"
          >
            Embed on Your Website
          </Typography>
          <Alert
            severity="info"
            className="mb-3"
          >
            <Typography variant="body2">
              To embed this gate on your website:
              <ol className="list-decimal ml-4 mt-2">
                <li>Copy the snippet code below</li>
                <li>
                  Paste it into your website's HTML, preferably just before the closing{' '}
                  <code>&lt;/body&gt;</code> tag
                </li>
                <li>
                  The gate will automatically appear in the bottom-right corner of your website
                </li>
              </ol>
            </Typography>
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            value={snippetCode}
            InputProps={{
              readOnly: true,
              className: 'font-mono text-sm',
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleCopyText(snippetCode, 'Snippet code copied to clipboard!')}
                  >
                    <Iconify icon="mdi:content-copy" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <Divider />

        {/* QR Code Section */}
        <div>
          <Typography
            variant="subtitle1"
            className="font-medium mb-2"
          >
            QR Code
          </Typography>
          <div
            ref={qrCodeRef}
            className="bg-white p-6 rounded-lg shadow-sm border flex justify-center items-center"
          >
            <QRCode
              value={link}
              size={200}
            />
          </div>
          <Button
            fullWidth
            onClick={handleCopyImage}
            color="primary"
            variant="outlined"
            className="mt-3"
            startIcon={<Iconify icon="mdi:download" />}
          >
            Download QR Code
          </Button>
        </div>
      </DialogContent>
      <DialogActions className="bg-gray-50 border-t p-3">
        <Button
          onClick={onClose}
          color="primary"
          variant="contained"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareGate;
