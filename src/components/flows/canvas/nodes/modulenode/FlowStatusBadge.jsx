import { Box } from '@mui/material';
import { forwardRef, memo } from 'react';

const badgeStyle = ({ status, size, sx }) => ({
  background: `radial-gradient(circle, ${status ? 'green' : 'red'} 40%, #fff 100%)`,
  height: size,
  width: size,
  borderRadius: '50%',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  ...(sx || {}),
});

const FlowStatusBadge = forwardRef(
  ({ status = 'red', onClick = null, sx = null, size = 20, ...other }, ref) => (
    <Box
      {...other}
      sx={badgeStyle({ status, sx, size })}
      onClick={onClick}
    >
    </Box>
  ),
);

export default memo(FlowStatusBadge);
