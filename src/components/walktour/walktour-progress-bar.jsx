import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function WalktourProgressBar({ totalSteps, currentStep, onGoStep }) {
  const theme = useTheme();

  const barStyles = {
    height: 2,
    bottom: 0,
    content: '""',
    position: 'absolute',
    width: `calc(100% / ${totalSteps} * ${currentStep})`,
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  };

  return (
    <Stack
      direction="row"
      sx={{
        left: 0,
        width: 1,
        bottom: -1,
        position: 'absolute',
        '&:before': barStyles,
      }}
    >
      {[...Array(totalSteps)].map((_, index) => {
        const stepIndex = index + 1;

        return (
          <ButtonBase
            disableRipple
            key={index}
            onClick={() => {
              if (currentStep !== stepIndex) {
                onGoStep(index);
              }
            }}
            sx={{
              pt: 1,
              width: `calc(100% / ${totalSteps})`,
              '&:hover': {
                bgcolor: 'action.hover',
                ...(currentStep >= stepIndex && {
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
                }),
              },
            }}
          />
        );
      })}
    </Stack>
  );
}

WalktourProgressBar.propTypes = {
  onGoStep: PropTypes.func,
  totalSteps: PropTypes.number,
  currentStep: PropTypes.number,
};
