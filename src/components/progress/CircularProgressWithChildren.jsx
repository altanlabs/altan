import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import * as React from 'react';

function CircularProgressWithChildren({ value, size, color, thickness, sx, children }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        color={color}
        thickness={thickness}
        sx={{ ...sx }}
        size={size}
        value={value}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

CircularProgressWithChildren.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

export default CircularProgressWithChildren;
