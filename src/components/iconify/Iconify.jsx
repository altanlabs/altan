import { Icon } from '@iconify/react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// icons
// @mui

// ----------------------------------------------------------------------

const Iconify = forwardRef(({ icon, width = 20, sx, ...other }, ref) => (
  <Box
    ref={ref}
    component={Icon}
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
));

Iconify.propTypes = {
  sx: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Iconify;
