import { Box, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { memo, forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui

// ----------------------------------------------------------------------

const Logo = forwardRef(
  ({ disabledLink = false, minimal = false, color = null, sx, ...other }, ref) => {
    const theme = useTheme();

    const fill = color || (theme.palette.mode === 'dark' ? 'white' : '#212B36');

    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          width: minimal ? { xs: 20, sm: 24 } : { xs: 36, sm: 52 },
          height: minimal ? { xs: 20, sm: 24 } : { xs: 36, sm: 52 },
          display: 'inline-flex',
          ...sx,
        }}
        {...other}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 84 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M83.5643 71.9914L42 0L0.435791 71.9914C9.40753 67.1723 24.6747 64 42 64C59.3253 64 74.5925 67.1723 83.5643 71.9914Z"
            fill={fill}
          />
        </svg>
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link
        component={RouterLink}
        to="/"
        sx={{ display: 'contents' }}
      >
        {logo}
      </Link>
    );
  },
);

Logo.displayName = 'Logo';

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default memo(Logo);
