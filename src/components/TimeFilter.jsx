import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import React, { useState } from 'react';

import DateRangePicker from './date-range-picker';

function TimeFilter({
  open,
  onClose,
  dateRange,
  onDateRangeChange,
  customDateRange,
  onCustomDateRangeChange,
}) {
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleDateRangeChange = (range) => {
    onCustomDateRangeChange(range);
    onDateRangeChange('custom');
  };

  const handleClearFilter = () => {
    onDateRangeChange('');
    onCustomDateRangeChange([null, null]);
  };

  return (
    <>
      <Dialog
        fullWidth
        open={open}
        onClose={onClose}
      >
        <DialogTitle>Filter Orders</DialogTitle>
        <DialogContent>
          <FormControl
            fullWidth
            margin="normal"
          >
            <InputLabel id="date-range-label">Date Range</InputLabel>
            <Select
              labelId="date-range-label"
              value={dateRange}
              label="Date Range"
              onChange={(e) => onDateRangeChange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="thisWeek">This Week</MenuItem>
              <MenuItem value="lastWeek">Last Week</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          {dateRange === 'custom' && (
            <Button
              onClick={() => setOpenDatePicker(true)}
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            >
              {customDateRange[0] && customDateRange[1]
                ? `${customDateRange[0].toLocaleDateString()} - ${customDateRange[1].toLocaleDateString()}`
                : 'Select Custom Date Range'}
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClearFilter}
            color="warning"
            variant="soft"
          >
            Clear Filter
          </Button>
          <Button
            onClick={onClose}
            color="primary"
            variant="soft"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <DateRangePicker
        variant="calendar"
        range={customDateRange}
        onChangeRange={handleDateRangeChange}
        open={openDatePicker}
        onClose={() => setOpenDatePicker(false)}
        isSelected={!!customDateRange[0] && !!customDateRange[1]}
        isError={false}
        onReset={() => onCustomDateRangeChange([null, null])}
      />
    </>
  );
}

export default TimeFilter;
