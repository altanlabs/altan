import { Stack, Typography, TextField, Autocomplete, Avatar, Chip } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';

import { optimai_integration } from '../utils/axios';
import IconRenderer from './icons/IconRenderer';
import { selectAccountId } from '../redux/slices/general';
import { useSelector } from '../redux/store';

const renderTags = (value, getTagProps) =>
  value.map((option, index) => {
    const { key, ...props } = getTagProps({ index });
    return (
      <Chip
        key={key}
        label={option.name}
        icon={
          <IconRenderer
            size={30}
            icon={option.icon}
          />
        }
        {...props}
      />
    );
  });

const renderOption = ({ key, ...props }, option) => (
  <li
    key={key}
    {...props}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      <Avatar
        sx={{ width: 24, height: 24 }}
        src={option.icon}
      />
      <Typography variant="body2">{option.name}</Typography>
    </Stack>
  </li>
);

const fetchApps = async (accountId) => {
  try {
    const response = await optimai_integration.get(`/account/${accountId}/apps`);
    return Promise.resolve(response.data.apps);
  } catch (e) {
    return Promise.reject(e);
  }
};

const AppsAutocomplete = ({ onChange, value, multiple = false }) => {
  const accountId = useSelector(selectAccountId);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoading(true);
      fetchApps(accountId)
        .then(setApps)
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const handleChange = useCallback(
    (event, newValue) => {
      if (multiple) {
        onChange(newValue.map((e) => e['id']));
      } else {
        onChange(newValue ? newValue['id'] : null);
      }
    },
    [multiple, onChange],
  );

  const selectedValue = multiple
    ? apps?.filter((a) => value?.includes(a['id']))
    : apps?.find((a) => a['id'] === value) || null;

  return (
    <Autocomplete
      sx={{ width: '100%' }}
      size="small"
      options={apps}
      loading={loading}
      multiple={multiple}
      isOptionEqualToValue={(option, value) => option['@id'] === value?.['@id']}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={multiple ? 'Select Apps' : 'Select an App'}
          variant="filled"
        />
      )}
      value={selectedValue}
      onChange={handleChange}
      renderOption={renderOption}
      renderTags={renderTags}
    />
  );
};

export default memo(AppsAutocomplete);
