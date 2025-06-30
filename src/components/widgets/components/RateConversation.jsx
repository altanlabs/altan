import { getTranslation } from '@assets/translations';
import { Typography, Rating, Box, Stack } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const RateConversation = ({ widget }) => {
  const data = widget.meta_data || {};
  const dispatch = useDispatch();
  const [value, setValue] = useState(data.default_rating || data.min_rating);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
      <Stack>
        <Typography variant="caption" gutterBottom>
          {getTranslation('rate', navigator.language || navigator.userLanguage)}
        </Typography>
        <Rating
          color="primary"
          name="rate-conversation"
          value={value}
          onChange={handleChange}
          max={data.max_rating}
          min={data.min_rating}
        />

      </Stack>

    </Box>
  );
};

export default RateConversation;
