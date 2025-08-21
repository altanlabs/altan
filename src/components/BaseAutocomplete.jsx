import { TextField, Autocomplete, Chip, Stack, Skeleton, FormControlLabel, Switch, Box } from '@mui/material';
import { memo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { selectCurrentAltaner } from '../redux/slices/altaners';
import { selectBases, getBasesByAccountID } from '../redux/slices/bases';
import { useSelector } from '../redux/store';

const BaseAutocomplete = ({ value, onChange }) => {
  const dispatch = useDispatch();
  const bases = useSelector(selectBases);
  const account = useSelector(state => state.general.account);
  const altaner = useSelector(selectCurrentAltaner);
  const [showAllBases, setShowAllBases] = useState(!altaner);
  const [loadingBases, setLoadingBases] = useState(false);
  const components = altaner?.components?.items || [];
  const baseIds = components.filter((c) => c.type === 'base').flatMap((c) => c.params?.ids);

  // Initialize bases if not already loaded
  useEffect(() => {
    if (account?.id && Object.keys(bases).length === 0 && !loadingBases) {
      setLoadingBases(true);
      dispatch(getBasesByAccountID(account.id))
        .catch(console.error)
        .finally(() => setLoadingBases(false));
    }
  }, [dispatch, account?.id, bases, loadingBases]);

  // Convert bases object to array
  const basesArray = Object.values(bases);

  if (loadingBases || basesArray.length === 0) {
    return (
      <Skeleton
        variant="rectangular"
        width={210}
        height={60}
      />
    );
  }

  const filteredBases = (!altaner || showAllBases)
    ? basesArray
    : basesArray.filter(base => baseIds.includes(base.id));

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
