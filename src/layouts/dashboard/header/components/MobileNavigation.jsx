import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { memo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../../components/iconify';

const MobileNavigation = memo(({
  altaner,
  onBackToDashboard,
}) => {
  const theme = useTheme();
  const history = useHistory();

  const handleBackClick = useCallback((event) => {
    event.stopPropagation();
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      history.push('/');
    }
  }, [onBackToDashboard, history]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        height: 42,
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={handleBackClick}
        size="small"

      >
        <Iconify
          icon="mdi:arrow-left"
          width={18}
          height={18}
        />
      </IconButton>

      {/* Project Name */}
      {altaner?.name && (
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px',
          }}
        >
          {altaner.name}
        </Typography>
      )}
    </Box>
  );
});

MobileNavigation.propTypes = {
  altaner: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  onBackToDashboard: PropTypes.func,
};

MobileNavigation.displayName = 'MobileNavigation';

export default MobileNavigation;
