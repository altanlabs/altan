// @mui
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const CustomTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'width',
})(({ width, theme }) => ({
  '& fieldset': {
    display: 'none',
  },
  '& .MuiOutlinedInput-root': {
    width,
    minWidth: 200,
    background: theme.palette.background.paper,
    transition: theme.transitions.create(['box-shadow', 'width'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&.Mui-focused': {
      boxShadow: theme.customShadows.z20,
      ...(width && {
        [theme.breakpoints.up('sm')]: {
          width: width + 60,
        },
      }),
    },
  },
}));

export default CustomTextField;
