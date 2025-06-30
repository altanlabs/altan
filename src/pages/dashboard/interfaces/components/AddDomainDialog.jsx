import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import React, { useState } from 'react';

import { optimai } from '../../../../utils/axios';

function AddDomainDialog({ open, onClose, ui }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [domainInfo, setDomainInfo] = useState(null);

  const handleAddDomain = async () => {
    try {
      const response = await optimai.post(`/interfaces/${ui.id}/domains`, { domain });
      setDomainInfo(response.data.domain); // Set the domain info from the response
      setDomain(''); // Clear the input field
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to add domain. Please try again.');
    }
  };

  const handleDeleteDomain = async (domainName) => {
    try {
      await optimai.delete(`/interfaces/${ui.id}/domains/${domainName}`);
      // Refresh domain info or close dialog after successful deletion
      setDomainInfo(null);
      onClose();
    } catch (err) {
      setError('Failed to delete domain. Please try again.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>Add Domain</DialogTitle>
      <DialogContent>
        <TextField
          label="Domain"
          placeholder="e.g. example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          fullWidth
          margin="normal"
          variant="filled"
          error={!!error}
          helperText={error}
        />
        {domainInfo && (
          <Stack
            spacing={2}
            sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">{domainInfo.configuration.name}</Typography>
              <IconButton
                onClick={() => handleDeleteDomain(domainInfo.configuration.name)}
                size="small"
                color="error"
                aria-label="delete domain"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Typography color="primary">
              Please configure your domain using the following DNS records:
            </Typography>
            {domainInfo.dns_records.map((record, index) => (
              <Stack
                key={index}
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  gutterBottom
                >
                  {record.type} Record {record.type === 'A' ? '(Main Record)' : '(Verification)'}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Type:</strong> {record.type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {record.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Value:</strong> {record.value}
                  </Typography>
                </Stack>
              </Stack>
            ))}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontStyle: 'italic' }}
            >
              Note: DNS changes may take up to 24-48 hours to propagate globally.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddDomain}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddDomainDialog;
