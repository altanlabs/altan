import { memo, useCallback, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

/**
 * Helper function to extract the field path from relationship mapping
 */
const getFieldPath = (fieldKey, relationshipMapping) => {
  const lastKey = fieldKey.split('.').slice(-1)[0];
  
  for (const key in relationshipMapping) {
    if (relationshipMapping[key]?.[lastKey] !== undefined) {
      return relationshipMapping[key][lastKey];
    }
  }
  
  return null;
};

/**
 * Helper function to extract value from resource details based on path
 */
const extractValueFromDetails = (details, path) => {
  if (!details || !path) return null;
  
  if (path.startsWith('[$]')) {
    const key = path.slice(4);
    return details[key];
  }
  
  return null;
};

/**
 * Autocomplete component that maps relationship resources to form fields
 * Uses relationship mapping to populate options from connected resources
 */
const DynamicFormFieldAutocompleteMapping = ({
  fieldKey,
  value,
  onChange,
  title,
  relationship,
}) => {
  // Get the mapping path for this field
  const path = useMemo(
    () => getFieldPath(fieldKey, relationship.mapping),
    [fieldKey, relationship.mapping],
  );

  // Create handler to extract value from resource details
  const getValueFromDetails = useCallback(
    (details) => extractValueFromDetails(details, path),
    [path],
  );

  // Map relationship resources to autocomplete options
  const resources = useMemo(
    () =>
      path
        ? relationship.resources?.map((resource) => ({
        label: resource.name,
        value: getValueFromDetails(resource.details),
          }))
        : null,
    [getValueFromDetails, path, relationship.resources],
  );

  const handleChange = useCallback(
    (e, selectedValue) => {
      if (selectedValue?.value) {
        onChange(selectedValue.value);
      }
    },
    [onChange],
  );

  if (!resources) {
    return null;
  }

  return (
    <div className="w-full">
    <Autocomplete
      options={resources}
      value={value}
        onChange={handleChange}
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
    </div>
  );
};

export default memo(DynamicFormFieldAutocompleteMapping);
