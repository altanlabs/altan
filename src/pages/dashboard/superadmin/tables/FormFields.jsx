import {
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  InputLabel,
  Input,
  Button,
  ButtonGroup,
  Stack,
  useTheme,
  CardContent,
  CardHeader,
  CardActions,
  Card,
  IconButton,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import AceWrapper from '@components/json/AceWrapper.jsx';

import Iconify from '../../../../components/iconify';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import { getTableSchema, createEntry, updateEntry } from '../../../../redux/slices/superadmin';
import { dispatch } from '../../../../redux/store';

const checkJSON = (type, variable) =>
  type === 'JSON' && !!variable && typeof variable !== 'object' && !Array.isArray(variable);

const validateInput = (tableSchema, formData) => {
  // Create a copy of formData
  const formattedData = { ...formData };
  // Loop through each formData attribute
  for (const key in formattedData) {
    if (formattedData[key] === '') {
      // Set value to null if empty string
      formattedData[key] = null;
    } else if (checkJSON(tableSchema.properties[key]?.type, formattedData[key])) {
      // Convert string to JSON object if the field type is JSON and not null
      try {
        formattedData[key] = JSON.parse(formattedData[key]);
      } catch (error) {
        console.error('Invalid JSON for key', key, ':', error);
        throw new Error(`Invalid JSON format for '${key}'.`); // Stop the submission if JSON is invalid
      }
    }
  }
  // Dispatch the action to create an entry
  // console.log(formattedData);
  return formattedData;
};

const FormFields = ({
  table,
  data = null,
  onReset = null,
  editingRow = null,
  isSuperAdmin = true,
  accountId = null,
  className = '',
  ...other
}) => {
  const theme = useTheme();
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [tableSchema, setTableSchema] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({});

  // UDPATE EDIT
  const handleSave = useCallback(async () => {
    let formattedData = null;
    try {
      formattedData = validateInput(tableSchema, formData);
    } catch (e) {
      enqueueSnackbar(e, { variant: 'error' });
    }
    if (!formattedData) return;
    const updatedEntry = Object.keys(formattedData)
      .filter((key) => !['id', 'date_creation'].includes(key))
      .reduce((obj, key) => {
        return {
          ...obj,
          [key]: formattedData[key],
        };
      }, {});
    dispatchWithFeedback(updateEntry(table, editingRow, updatedEntry), {
      useSnackbar: true,
      successMessage: 'Entry updated successfully.',
      errorMessage: 'There was an error updating the entry:',
    }).then(() => {
      if (onReset) onReset();
    });
  }, [dispatchWithFeedback, editingRow, enqueueSnackbar, formData, onReset, table, tableSchema]);

  // CREATE ENTRY
  const handleSubmit = useCallback(async () => {
    let formattedData = null;
    try {
      formattedData = validateInput(tableSchema, formData);
    } catch (e) {
      enqueueSnackbar(e, { variant: 'error' });
    }
    if (!formattedData) return;
    dispatchWithFeedback(createEntry(table, formattedData), {
      useSnackbar: true,
      successMessage: 'Entry created successfully.',
      errorMessage: 'There was an error creating the entry:',
    }).then(() => {
      onReset();
    });
  }, [dispatchWithFeedback, enqueueSnackbar, formData, onReset, table, tableSchema]);

  const handleJsonChange = useCallback((update, propertyName) => {
    setFormData((oldData) => ({ ...oldData, [propertyName]: update }));
  }, []);

  const handleChange = useCallback(
    (e, propertyName) => {
      const value = e.target.value;
      // Additional check for JSON type fields
      if (checkJSON(tableSchema.properties[propertyName].type, value)) {
        try {
          // This will throw an error if the value is not valid JSON
          JSON.parse(value);
          // Add any additional logic if needed, e.g., formatting
        } catch (error) {
          // Handle invalid JSON, e.g., set an error state or message
          console.error('Invalid JSON:', error);
        }
      }
      setFormData((oldData) => ({ ...oldData, [propertyName]: value }));
    },
    [tableSchema.properties],
  );

  const handleDiscardChanges = useCallback(() => {
    if (onReset) onReset();
    enqueueSnackbar('Changes discarded.', { variant: 'info' });
    setFormData({});
  }, [enqueueSnackbar, onReset]);

  // console.log("TABLE SCHEMA:", tableSchema);

  useEffect(() => {
    const fetchSchema = async () => {
      setIsLoading(true);
      dispatch(getTableSchema(table))
        .then((schema) => setTableSchema(schema))
        .finally(() => setIsLoading(false));
    };
    if (table) fetchSchema();
  }, [table]);

  useEffect(() => {
    if (data) {
      const newFormData = { ...data };
      if (!isSuperAdmin && !newFormData.account_id) {
        newFormData.account_id = accountId;
      }
      setFormData(newFormData);
    } else {
      setFormData({});
    }
  }, [data, isSuperAdmin, accountId]);

  const renderFormFields = useMemo(() => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (tableSchema && tableSchema.properties) {
      return Object.entries(tableSchema.properties).map(([key, value]) => {
        const alwaysDisabled = ['id', 'date_creation'].includes(key);
        const disabled = alwaysDisabled || (!isSuperAdmin && key === 'account_id');

        // If it's not a superadmin and the field is account_id, use the hardcoded value
        const fieldValue = !isSuperAdmin && key === 'account_id' ? accountId : formData[key] || '';

        switch (value.type) {
          case 'BOOLEAN':
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fieldValue || false}
                    onChange={(e) => handleChange({ target: { value: e.target.checked } }, key)}
                  />
                }
                disabled={disabled}
                label={key}
                key={key}
              />
            );
          case 'FLOAT':
          case 'VARCHAR(255)': // This is the default type for 'STRING
          case 'VARCHAR':
          case 'VARCHAR(36)': // Add more cases as needed
          case 'VARCHAR(100)':
          case 'DATETIME':
          case 'TEXT':
            return (
              <TextField
                label={key}
                value={fieldValue}
                onChange={(e) => handleChange(e, key)}
                margin="normal"
                fullWidth
                disabled={disabled}
                key={key}
                size="small"
                type={value.type === 'FLOAT' ? 'number' : 'text'}
              />
            );
          case 'JSON':
            return (
              <React.Fragment key={key}>
                <InputLabel htmlFor={key}>{key}</InputLabel>
                <AceWrapper
                  themeMode={theme.palette.mode}
                  name={key}
                  value={
                    formData[key]
                      ? JSON.stringify(formData[key]).length > 25000
                        ? 'Data too long'
                        : formData[key]
                      : null
                  }
                  onChange={(update) => handleJsonChange(update, key)}
                  style={{
                    minHeight: '100px',
                    width: '100%',
                  }}
                  useWorker={true}
                  readOnly={disabled}
                />
              </React.Fragment>
            );
          default:
            return (
              <FormControl
                key={key}
                disabled={disabled}
                fullWidth
                margin="normal"
              >
                <InputLabel htmlFor={key}>{key}</InputLabel>
                <Input
                  id={key}
                  value={fieldValue}
                  onChange={(e) => handleChange(e, key)}
                />
              </FormControl>
            );
        }
      });
    }
    return null;
  }, [
    isLoading,
    tableSchema,
    isSuperAdmin,
    accountId,
    formData,
    theme.palette.mode,
    handleChange,
    handleJsonChange,
  ]);

  return (
    <Card
      className={className}
      {...other}
    >
      <CardHeader
        title={!!editingRow ? `Editing ${table}` : `Creating ${table}`}
        subheader={!!editingRow ? editingRow : ''}
        action={
          <IconButton
            size="small"
            onClick={onReset}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        }
      />
      <CardContent className="  overflow-y-auto">
        {renderFormFields}
      </CardContent>
      <CardActions disableSpacing>
        <Stack
          spacing={1}
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          {editingRow !== null ? (
            <ButtonGroup fullWidth>
              <Button
                variant="contained"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={handleDiscardChanges}
              >
                Discard
              </Button>
            </ButtonGroup>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
};

export default memo(FormFields);
