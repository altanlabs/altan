import { Stack, TextField, Autocomplete } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectIteratorModules } from '../redux/slices/flows';

const IteratorAutocomplete = ({ onChange, value }) => {
  const iterators = useSelector(selectIteratorModules);

  const iteratorOptions = useMemo(
    () =>
      Object.values(iterators).map((iterator) => ({
        id: iterator.id,
        name: `Iterator in position ${iterator.position}`,
        position: iterator.position,
      })),
    [iterators],
  );

  const handleChange = useCallback(
    (event, newValue) => {
      console.log('new', newValue);
      onChange(newValue?.position?.toString() || null);
    },
    [onChange],
  );

  const numericValue = value ? Number(value) : null;

  const selectedOption = useMemo(
    () => iteratorOptions.find((option) => option.position === numericValue) || null,
    [iteratorOptions, numericValue],
  );

  return (
    <Stack
      spacing={0.5}
      width="100%"
    >
      {iteratorOptions && iteratorOptions.length > 0 ? (
        <>
          <Autocomplete
            size="small"
            id="iterator-autocomplete"
            options={iteratorOptions}
            isOptionEqualToValue={(option, value) => option.position === numericValue}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select an iterator to aggregate"
                variant="outlined"
              />
            )}
            onChange={handleChange}
            value={selectedOption}
          />
        </>
      ) : (
        <>You can't add an aggregator without an iterator first</>
      )}
    </Stack>
  );
};

export default memo(IteratorAutocomplete);
