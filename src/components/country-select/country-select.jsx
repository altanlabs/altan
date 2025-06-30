import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';

import Iconify from '@components/iconify';

import { countries } from '../assets/data';

// ----------------------------------------------------------------------

export default function CountrySelect({ label, error, helperText, placeholder, ...other }) {
  const multiple = other?.multiple;

  return (
    <Autocomplete
      autoHighlight={!multiple}
      disableCloseOnSelect={multiple}
      renderOption={(props, option) => {
        const country = getCountry(option);

        if (!country.label) {
          return null;
        }

        return (
          <li
            {...props}
            key={country.label}
          >
            <Iconify
              key={country.label}
              icon={`circle-flags:${country.code?.toLowerCase()}`}
              sx={{ mr: 1 }}
            />
            {country.label} ({country.code}) +{country.phone}
          </li>
        );
      }}
      renderInput={(params) => {
        const country = getCountry(params.inputProps.value);

        const baseField = {
          ...params,
          label,
          placeholder,
          error: !!error,
          helperText,
          inputProps: {
            ...params.inputProps,
            autoComplete: 'new-password',
          },
        };

        if (multiple) {
          return <TextField {...baseField} />;
        }

        return (
          <TextField
            {...baseField}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{
                    ...(!country.code && {
                      display: 'none',
                    }),
                  }}
                >
                  <Iconify
                    icon={`circle-flags:${country.code?.toLowerCase()}`}
                    sx={{ mr: -0.5, ml: 0.5 }}
                  />
                </InputAdornment>
              ),
            }}
          />
        );
      }}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => {
          const country = getCountry(option);

          return (
            <Chip
              {...getTagProps({ index })}
              key={country.label}
              label={country.label}
              icon={<Iconify icon={`circle-flags:${country.code?.toLowerCase()}`} />}
              size="small"
              variant="soft"
            />
          );
        })}
      {...other}
    />
  );
}

CountrySelect.propTypes = {
  error: PropTypes.bool,
  label: PropTypes.string,
  helperText: PropTypes.node,
  placeholder: PropTypes.string,
};

// ----------------------------------------------------------------------

export function getCountry(inputValue) {
  const option = countries.filter((country) => country.label === inputValue)[0];

  return {
    ...option,
  };
}
