import {
  TextField,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React, { memo, useCallback } from 'react';
import usePlacesAutocomplete, { getGeocode } from 'use-places-autocomplete';

import Iconify from './iconify/Iconify';

const AddressAutocompleteReal = ({ value: currentAddress, onChange }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = useCallback(
    ({ description }) =>
      () => {
        setValue(description, false);
        clearSuggestions();

        getGeocode({ address: description })
          .then((results) => {
            if (results.length > 0) {
              const addressComponents = results[0].address_components;
              const addressObj = {
                name: results[0].formatted_address,
                street: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
                latitude: null,
                longitude: null,
              };

              // console.log(results[0]);
              addressComponents.forEach((component) => {
                const types = component.types;
                if (types.includes('street_number')) {
                  addressObj.street = `${component.long_name} ${addressObj.street || ''}`;
                } else if (types.includes('route')) {
                  addressObj.street = `${addressObj.street || ''} ${component.long_name}`;
                } else if (types.includes('locality')) {
                  addressObj.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  addressObj.state = component.short_name;
                } else if (types.includes('postal_code')) {
                  addressObj.postal_code = component.long_name;
                } else if (types.includes('country')) {
                  addressObj.country = component.short_name;
                }
              });

              const location = results[0].geometry.location;
              addressObj.latitude = location.lat();
              addressObj.longitude = location.lng();

              onChange(addressObj);
            }
          })
          .catch((error) => {
            console.log('Error: ', error);
          });
      },
    [clearSuggestions, onChange, setValue],
  );

  const renderSuggestions = useCallback(
    () =>
      data.map((suggestion) => {
        const {
          id,
          structured_formatting: { main_text, secondary_text },
        } = suggestion;

        return (
          <ListItemButton
            key={id}
            onClick={handleSelect(suggestion)}
          >
            <ListItemText
              primary={main_text}
              secondary={secondary_text}
            />
          </ListItemButton>
        );
      }),
    [data, handleSelect],
  );

  if (!!currentAddress)
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center' }}
      >
        <Typography>{currentAddress.name}</Typography>

        <IconButton onClick={() => onChange(null)}>
          <Iconify icon="bx:edit" />
        </IconButton>
      </Stack>
    );

  return (
    <div style={{ width: '100%' }}>
      <TextField
        fullWidth
        value={value}
        onChange={handleInput}
        disabled={!ready}
        label="Address"
        size="small"
        variant="standard"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton>
                <Iconify icon="material-symbols:search" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {status === 'OK' && <List>{renderSuggestions()}</List>}
    </div>
  );
};

export default memo(AddressAutocompleteReal);
