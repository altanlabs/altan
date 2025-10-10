import { Box, TextField, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

function NavigationInput({ onNavigate, disabled = false, placeholder = "about-us" }) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && onNavigate) {
      const path = `/${inputValue.trim()}`;
      onNavigate(path);
      setInputValue('');
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Box 
      component="form"
      onSubmit={handleSubmit}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        minWidth: 150, 
        maxWidth: 200,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.primary,
          fontSize: '0.875rem',
          fontWeight: 500,
          mx: 1,
        }}
      >
        /
      </Typography>
      <TextField
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="small"
        disabled={disabled}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            height: 32,
            borderRadius: 1.5,
            backgroundColor: 'transparent',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
            py: 0,
            px: 0,
            '&::placeholder': {
              color: alpha(theme.palette.text.secondary, 0.5),
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
}

NavigationInput.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default NavigationInput;
