import { Box, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';

import LiveDevToggle from './buttons/LiveDevToggle';
import NavigationActionButtons from './buttons/NavigationActionButtons';
import ViewModeToggle from './buttons/ViewModeToggle';
import NavigationInput from './navigation/NavigationInput';

function URLNavigationBar({
  onNavigate,
  onOpenInNewTab,
  onRefresh,
  productionUrl,
  disabled = false,
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 40,
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          marginTop: 0.5,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          p: 0.25,
          gap: 0.25,
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
          },
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {/* Left side - View mode toggle first */}

        {/* Action buttons */}
        <NavigationActionButtons
          onRefresh={onRefresh}
          onOpenInNewTab={onOpenInNewTab}
          disabled={disabled}
        />
        <ViewModeToggle disabled={disabled} />

        {/* Navigation input */}
        <NavigationInput
          onNavigate={onNavigate}
          disabled={disabled}
          placeholder="about-us"
        />

        {/* Right side controls */}
        <Stack
          direction="row"
          spacing={0.25}
          alignItems="center"
        >
          <LiveDevToggle
            productionUrl={productionUrl}
            disabled={disabled}
          />
        </Stack>
      </Box>
    </Box>
  );
}

URLNavigationBar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onOpenInNewTab: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  productionUrl: PropTypes.string,
  disabled: PropTypes.bool,
};

export default URLNavigationBar;
