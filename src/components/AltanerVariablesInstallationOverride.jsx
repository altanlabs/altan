import { Stack, TextField, Autocomplete, Typography, IconButton } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';

import Iconify from './iconify';
import { selectCurrentAltaner } from '../redux/slices/altaners';
import { useSelector } from '../redux/store.ts';
import FormParameter from './tools/form/FormParameter';

const renderInput = ({ key, ...params }) => (
  <TextField
    {...params}
    label="Add variable override"
    variant="outlined"
    size="small"
    fullWidth
  />
);

const renderVarToSet = (fieldKey, onDelete) => (item, index) => {
  const schema = {
    type: item.type,
    title: item.name,
    description: item.description,
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      key={`${fieldKey}.${index}.value`}
    >
      <IconButton
        size="small"
        onClick={onDelete(index)}
      >
        <Iconify
          icon="mdi:delete"
          width={15}
        />
      </IconButton>
      <FormParameter
        fieldKey={`${fieldKey}.${index}.value`}
        schema={schema}
        enableLexical={true}
      />
    </Stack>
  );
};

function AltanerVariablesInstallationOverride({ fieldKey, onChange, value }) {
  const altaner = useSelector(selectCurrentAltaner);
  const propertiesToSet = useMemo(
    () =>
      altaner?.meta_data?.variables
        ?.filter((v) => !!v.inherits_from_installer)
        ?.reduce((acc, v) => {
          acc[v.name] = v;
          return acc;
        }, {}) ?? {},
    [altaner?.meta_data?.variables],
  );
  const usedNames = useMemo(() => (value ?? []).map((item) => item.name), [value]);

  // Determine which properties are left to set
  const remainingProperties = useMemo(
    () => Object.keys(propertiesToSet).filter((name) => !usedNames.includes(name)),
    [propertiesToSet, usedNames],
  );

  const handleAddProperty = useCallback(
    (event, newProperty) => {
      if (newProperty) {
        const updatedValue = [...(value ?? []), { name: newProperty, value: '' }];
        onChange(updatedValue);
      }
    },
    [onChange, value],
  );

  const handleDeleteProperty = useCallback(
    (index) => () => {
      const updatedValue = value.filter((_, i) => i !== index);
      onChange(updatedValue);
    },
    [onChange, value],
  );

  const renderValue = useCallback(
    (item, index) =>
      renderVarToSet(fieldKey, handleDeleteProperty)(propertiesToSet[item.name], index),
    [fieldKey, handleDeleteProperty, propertiesToSet],
  );

  return (
    <Stack
      spacing={1}
      height="100%"
      width="100%"
      justifyContent="center"
    >
      {value?.map(renderValue)}
      {remainingProperties.length > 0 ? (
        <Autocomplete
          options={remainingProperties}
          getOptionLabel={(option) => option}
          renderInput={renderInput}
          onChange={handleAddProperty}
          value={null} // Reset value after selection
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          No more variables to override
        </Typography>
      )}
    </Stack>
  );
}

export default memo(AltanerVariablesInstallationOverride);
