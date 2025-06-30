import { TextField, Autocomplete, Avatar, Chip, Stack, Divider, Skeleton } from '@mui/material';
import { memo } from 'react';

import { useSelector } from '../redux/store';
import GateDialog from '../sections/@dashboard/gates/GateDialog';

const GateAutocomplete = ({ value, onChange }) => {
  const gates = useSelector((state) => state.general.account.gates);
  if (!gates)
    return (
      <Skeleton
        variant="rectangular"
        width={210}
        height={60}
      />
    );
  return (
    <Stack
      sx={{ width: '100%' }}
      spacing={1}
    >
      <Autocomplete
        sx={{ ml: 1 }}
        fullWidth
        size="small"
        id="gate-autocomplete"
        options={gates}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select gate"
            variant="outlined"
          />
        )}
        value={gates?.find((g) => g.id === value) || null}
        onChange={(e, v) => {
          if (v && v.id === 'create-new-gate') {
            setOpenGateDialog(true);
          } else {
            onChange(v?.id);
          }
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option.key}
              label={option.name}
              icon={
                <Avatar
                  sx={{ width: 20, height: 20 }}
                  variant={'circular'}
                />
              }
              {...getTagProps({ index })}
            />
          ))}
      />
      <Divider>OR</Divider>
      <GateDialog />
    </Stack>
  );
};

export default memo(GateAutocomplete);
