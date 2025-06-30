import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { memo, useCallback, useMemo } from 'react';

const DynamicFormFieldAutocompleteMapping = ({
  fieldKey,
  value,
  onChange,
  title,
  relationship,
}) => {
  const path = useMemo(() => {
    let valuePath;
    const lastKey = fieldKey.split('.').slice(-1)[0];
    for (const key in relationship.mapping) {
      // if (Object.prototype.hasOwnProperty.call(relationship.mapping, key)) {

      // }
      if (relationship.mapping[key]?.[lastKey] !== undefined) {
        valuePath = relationship.mapping[key][lastKey];
        break;
      }
    }
    return valuePath;
  }, [relationship.mapping, fieldKey]);

  const getValueFromDetails = useCallback(
    (details) => {
      if (!details || !path) return null;
      if (path.startsWith('[$]')) {
        const key = path.slice(4);
        return details[key];
      }
      return null;
    },
    [path],
  );

  const resources = useMemo(
    () =>
      !!path &&
      relationship.resources?.map((resource) => ({
        label: resource.name,
        value: getValueFromDetails(resource.details),
      })),
    [getValueFromDetails, path, relationship.resources],
  );

  if (!resources) return null;

  return (
    <Autocomplete
      options={resources}
      value={value}
      onChange={(e, v) => onChange(v.value)}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={title}
          variant="filled"
          size="small"
        />
      )}
    />
  );
};

export default memo(DynamicFormFieldAutocompleteMapping);
