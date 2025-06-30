import { TextField, Box, Button } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { addAccountAddress } from '../../redux/slices/general';

const APIKey = 'AIzaSyCO7JBm4dwdp9so6h3GTxHgDavcLN5hpHw';

const loadGoogleMapsScript = (callback) => {
  if (window.google) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${APIKey}&libraries=places&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;
  window.initGoogleMaps = callback;
  document.head.appendChild(script);
};

const AddressAutocomplete = ({ onClose }) => {
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    // googleMapLink: ''
  });
  let autocomplete = null;
  const [isApiLoaded, setApiLoaded] = useState(false);
  const autocompleteRef = useRef(null);

  const handlePlaceSelect = () => {
    const addressObject = autocomplete.getPlace();
    const addressComponents = addressObject.address_components;

    if (!addressComponents) {
      return;
    }

    const getAddressComponent = (type) => {
      const component = addressComponents.find((c) => c.types.includes(type));
      return component ? component.long_name : '';
    };
    setAddress({
      name: addressObject.name,
      street_address: `${getAddressComponent('street_number')} ${getAddressComponent('route')}`,
      city: getAddressComponent('locality'),
      state: getAddressComponent('administrative_area_level_1'),
      zip_code: getAddressComponent('postal_code'),
      googleMapLink: addressObject.url,
    });
  };

  const loadAutocomplete = () => {
    autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
      fields: ['address_components', 'geometry', 'name', 'url'],
    });
    autocomplete.addListener('place_changed', handlePlaceSelect);
  };

  useEffect(() => {
    loadGoogleMapsScript(() => setApiLoaded(true));
  }, []);

  useEffect(() => {
    if (isApiLoaded) {
      loadAutocomplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiLoaded]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    event.preventDefault();
    dispatchWithFeedback(addAccountAddress(address), {
      successMessage: 'Location added successfully',
      errorMessage: 'There was a problem adding location...',
      useSnackbar: true,
    });
    onClose();
  };

  return (
    <Box
      rowGap={1}
      columnGap={1}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
      }}
      component="form"
      noValidate
      autoComplete="off"
    >
      <TextField
        size="small"
        name="name"
        label="Name (for you)"
        variant="outlined"
        fullWidth
        value={address.name}
        onChange={handleChange}
      />

      <TextField
        size="small"
        name="street"
        label="Street Address"
        variant="outlined"
        fullWidth
        value={address.street}
        onChange={handleChange}
      />
      <TextField
        size="small"
        name="city"
        label="City"
        variant="outlined"
        fullWidth
        value={address.city}
        onChange={handleChange}
      />
      <TextField
        size="small"
        name="state"
        label="State"
        variant="outlined"
        fullWidth
        value={address.state}
        onChange={handleChange}
      />
      <TextField
        size="small"
        name="postal_code"
        label="Zip Code"
        variant="outlined"
        fullWidth
        value={address.postal_code}
        onChange={handleChange}
      />
      <TextField
        size="small"
        name="country"
        label="Country"
        variant="outlined"
        fullWidth
        value={address.country}
        onChange={handleChange}
      />
      <Button
        onClick={onClose}
        color="error"
      >
        Discard
      </Button>
      <Button
        onClick={handleSubmit}
        variant="soft"
      >
        Save
      </Button>
    </Box>
  );
};

export default AddressAutocomplete;
