import { Box, Typography, Button, Stack } from '@mui/material';
import { memo } from 'react';

import Iconify from '../../../iconify';

const EmptyTableState = memo(({ onImportCSV, onCreateRecord, tableName = 'table' }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 16,
        px: 3,
        maxWidth: '380px',
        mx: 'auto',
      }}
    >
      {/* Clean typography - Supabase style */}
      <Typography
        variant="body1"
        sx={{
          mb: 1,
          fontWeight: 500,
          color: (theme) => theme.palette.text.primary,
          fontSize: '15px',
        }}
      >
        No data in {tableName}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: (theme) => theme.palette.text.secondary,
          lineHeight: 1.5,
          fontSize: '13px',
          opacity: 0.8,
        }}
      >
        Click on any cell in the first row to start adding data
      </Typography>

      {/* Action buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          size="small"
          startIcon={
            <Iconify
              icon="mdi:plus"
              width={14}
              height={14}
            />
          }
          onClick={onCreateRecord}
        >
          Create Record
        </Button>
        <Button
          variant="soft"
          size="small"
          color="secondary"
          startIcon={
            <Iconify
              icon="mdi:upload"
              width={14}
              height={14}
            />
          }
          onClick={onImportCSV}
        >
          Import CSV
        </Button>
      </Stack>
    </Box>
  );
});

EmptyTableState.displayName = 'EmptyTableState';

export default EmptyTableState;
