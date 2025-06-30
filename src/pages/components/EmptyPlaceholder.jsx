import { Typography, Box } from '@mui/material';
import { memo, useState } from 'react';

function EmptyPlaceholder({ image, alt, message, children }) {
  const [loading, setLoading] = useState(true);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25em',
        ...(loading && {
          display: 'none',
        }),
      }}
    >
      <img
        src={image}
        alt={alt}
        style={{
          width: 'auto',
          maxHeight: '40vh',
          maxWidth: '50%',
          borderRadius: '10%',
        }}
        onLoad={() => setLoading(false)}
      />
      <Typography
        variant="h5"
        align="center"
        sx={{
          maxWidth: '70%',
        }}
      >
        {message}
      </Typography>
      {children}
    </Box>
  );
}

export default memo(EmptyPlaceholder);
