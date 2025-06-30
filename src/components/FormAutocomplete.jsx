import { Stack, TextField, Autocomplete, Divider, Button } from '@mui/material';
import { memo, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import CreateFormDialog from '../pages/dashboard/forms/CreateFormDialog.jsx';

const selectForms = (state) => state.general.account?.forms;

function FormAutocomplete({ onChange, value, multiple = false }) {
  const forms = useSelector(selectForms);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = useCallback(
    (event, newValue) => {
      if (multiple) {
        onChange(newValue.map((flow) => flow.id));
      } else {
        onChange(newValue ? newValue.id : null);
      }
    },
    [multiple, onChange],
  );

  const selectedValue = useMemo(
    () =>
      multiple
        ? forms?.filter((flow) => value?.includes(flow.id))
        : forms?.find((flow) => flow.id === value) || null,
    [forms, multiple, value],
  );

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Stack
      spacing={0.5}
      sx={{ width: '100%' }}
    >
      {forms && forms.length > 0 ? (
        <>
          <Autocomplete
            multiple={multiple}
            size="small"
            id="form-autocomplete"
            options={forms}
            isOptionEqualToValue={(option, value) =>
              option.id === (typeof value === 'string' ? value : value.id)}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label={multiple ? 'Select Forms' : 'Select a Form'}
                variant="outlined"
              />
            )}
            value={selectedValue}
            onChange={handleChange}
          />
          <Divider>or</Divider>
        </>
      ) : null}
      <Button
        variant="contained"
        onClick={handleOpenDialog}
      >
        Create Form
      </Button>
      <CreateFormDialog
        open={openDialog}
        handleClose={handleCloseDialog}
      />
    </Stack>
  );
}

export default memo(FormAutocomplete);
