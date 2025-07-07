import { TextField, Autocomplete, Chip, Stack, Skeleton, FormControlLabel, Switch, Box } from '@mui/material';
import { memo, useState } from 'react';

import { selectCurrentAltaner } from '../redux/slices/altaners';
import { useSelector } from '../redux/store';

const BaseAutocomplete = ({ value, onChange }) => {
  const bases = useSelector((state) => state.general.account.bases);
  const altaner = useSelector(selectCurrentAltaner);
  const [showAllBases, setShowAllBases] = useState(!altaner);
  const components = altaner?.components?.items || [];
  const baseIds = components.filter((c) => c.type === 'base').flatMap((c) => c.params?.ids);

  if (!bases) {
    return (
      <Skeleton
        variant="rectangular"
        width={210}
        height={60}
      />
    );
  }

  const filteredBases = (!altaner || showAllBases)
    ? bases
    : bases.filter(base => baseIds.includes(base.id));

  return (
    <Stack sx={{ width: '100%' }} spacing={1}>
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        <Autocomplete
          fullWidth
          size="small"
          id="base-autocomplete"
          options={filteredBases}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select base"
              variant="outlined"
            />
          )}
          value={filteredBases?.find((b) => b.id === value) || null}
          onChange={(e, v) => onChange(v?.id)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option.key}
                label={option.name}
                {...getTagProps({ index })}
              />
            ))}
          PopperProps={{
            style: {
              zIndex: 99999,
            },
            placement: 'bottom-start',
          }}
          slotProps={{
            popper: {
              style: {
                zIndex: 99999,
              },
            },
          }}
        />
        {altaner && (
          <FormControlLabel
            control={
              <Switch
                checked={showAllBases}
                onChange={(e) => setShowAllBases(e.target.checked)}
                color="primary"
              />
            }
            label={showAllBases ? 'All Bases' : 'Altaner Bases'}
            labelPlacement="start"
            sx={{ ml: 2, whiteSpace: 'nowrap' }}
          />
        )}
      </Box>
    </Stack>
  );
};

export default memo(BaseAutocomplete);
