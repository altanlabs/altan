import { TextField, Card } from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const DateTimePicker = ({ widget, theme }) => {
  const data = widget.meta_data;
  const textColor = theme === 'light' ? '#333' : '#fff';

  // Create dayjs instances instead of native Date instances
  const selectedDateDefault = data.default_datetime ? dayjs(data.default_datetime) : dayjs();
  const [selectedDate, handleDateChange] = useState(selectedDateDefault);

  const minDateTime = dayjs(data.min_date + 'T' + data.min_time + ':00Z');
  const maxDateTime = dayjs(data.max_date + 'T' + data.max_time + ':00Z');

  return (
    <Card sx={{ background: 'grey', p: 1 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MobileDateTimePicker
          label="Date & Time"
          inputFormat="yyyy/MM/dd hh:mm a"
          value={selectedDate}
          onChange={handleDateChange}
          minDateTime={minDateTime}
          maxDateTime={maxDateTime}
          minutesStep={data.time_interval || 1}
          renderInput={(params) => <TextField {...params} InputProps={{ ...params.InputProps, style: { color: textColor } }} />}
        />
      </LocalizationProvider>
    </Card>
  );
};

export default DateTimePicker;
