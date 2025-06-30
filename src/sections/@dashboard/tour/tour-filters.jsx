import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import CountrySelect from '@components/country-select';
import Iconify from '@components/iconify/Iconify';
import Scrollbar from '@components/scrollbar';

// ----------------------------------------------------------------------

export default function TourFilters({
  open,
  onOpen,
  onClose,
  //
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  destinationOptions,
  tourGuideOptions,
  serviceOptions,
  //
  dateError,
}) {
  const handleFilterServices = useCallback(
    (newValue) => {
      const checked = filters.services.includes(newValue)
        ? filters.services.filter((value) => value !== newValue)
        : [...filters.services, newValue];
      onFilters('services', checked);
    },
    [filters.services, onFilters],
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);
    },
    [onFilters],
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue);
    },
    [onFilters],
  );

  const handleFilterDestination = useCallback(
    (newValue) => {
      onFilters('destination', newValue);
    },
    [onFilters],
  );

  const handleFilterTourGuide = useCallback(
    (newValue) => {
      onFilters('tourGuides', newValue);
    },
    [onFilters],
  );

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography
        variant="h6"
        sx={{ flexGrow: 1 }}
      >
        Filters
      </Typography>

      <Tooltip title="Reset">
        <IconButton onClick={onResetFilters}>
          <Badge
            color="error"
            variant="dot"
            invisible={!canReset}
          >
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderDateRange = (
    <Stack>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1.5 }}
      >
        Durations
      </Typography>
      <Stack spacing={2.5}>
        <DatePicker
          label="Start date"
          value={filters.startDate}
          onChange={handleFilterStartDate}
        />

        <DatePicker
          label="End date"
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              error: dateError,
              helperText: dateError && 'End date must be later than start date',
            },
          }}
        />
      </Stack>
    </Stack>
  );

  const renderDestination = (
    <Stack>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1.5 }}
      >
        Destination
      </Typography>

      <CountrySelect
        placeholder={filters.destination.length ? '+ Destination' : 'Select Destination'}
        fullWidth
        multiple
        value={filters.destination}
        onChange={(event, newValue) => handleFilterDestination(newValue)}
        options={destinationOptions}
        getOptionLabel={(option) => option}
      />
    </Stack>
  );

  const renderTourGuide = (
    <Stack>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1.5 }}
      >
        Tour Guide
      </Typography>

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={tourGuideOptions}
        value={filters.tourGuides}
        onChange={(event, newValue) => handleFilterTourGuide(newValue)}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            placeholder="Select Tour Guides"
            {...params}
          />
        )}
        renderOption={(props, tourGuide) => (
          <li
            {...props}
            key={tourGuide.id}
          >
            <Avatar
              key={tourGuide.id}
              alt={tourGuide.avatarUrl}
              src={tourGuide.avatarUrl}
              sx={{ width: 24, height: 24, flexShrink: 0, mr: 1 }}
            />

            {tourGuide.name}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((tourGuide, index) => (
            <Chip
              {...getTagProps({ index })}
              key={tourGuide.id}
              size="small"
              variant="soft"
              label={tourGuide.name}
              avatar={
                <Avatar
                  alt={tourGuide.name}
                  src={tourGuide.avatarUrl}
                />
              }
            />
          ))}
      />
    </Stack>
  );

  const renderServices = (
    <Stack>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1 }}
      >
        Services
      </Typography>
      {serviceOptions.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={filters.services.includes(option)}
              onClick={() => handleFilterServices(option)}
            />
          }
          label={option}
        />
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge
            color="error"
            variant="dot"
            invisible={!canReset}
          >
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        {renderHead}

        <Divider />

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderDateRange}

            {renderDestination}

            {renderTourGuide}

            {renderServices}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}

TourFilters.propTypes = {
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  canReset: PropTypes.bool,
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  serviceOptions: PropTypes.array,
  tourGuideOptions: PropTypes.array,
  destinationOptions: PropTypes.array,
};
