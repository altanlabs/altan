import { Typography, Box } from '@mui/material';
import React from 'react';

function WebhooksEditor({ connectionType }) {
  if (!connectionType) {
    return <Typography variant="h6">Connection Type not found</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6">Webhooks</Typography>
      {(Array.isArray(connectionType.webhooks?.items) ? connectionType.webhooks.items : []).map(
        (webhook) => (
          <Box
            key={webhook.id}
            sx={{ ml: 2 }}
          >
            <Typography variant="body2">Webhook Name: {webhook.name}</Typography>
            {/* Add more fields and editing capabilities */}
          </Box>
        ),
      )}
    </Box>
  );
}

export default WebhooksEditor;
