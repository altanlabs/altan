import { InputAdornment } from '@mui/material';
import { memo } from 'react';

import CustomTextField from './CustomTextField';
import Iconify from '../iconify/Iconify';

const SearchField = ({ value, onChange, placeholder, ...other }) => {
  return (
    <CustomTextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...other}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify
              icon="eva:search-fill"
              sx={{ color: 'text.disabled' }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default memo(SearchField);
