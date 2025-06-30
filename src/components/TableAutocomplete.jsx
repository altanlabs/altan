import {
  Stack,
  Autocomplete,
  TextField,
  Typography,
  Box,
  Chip,
  Paper,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

// import { fetchBaseById } from '../redux/slices/bases';
import { selectAccount } from '../redux/slices/general';
import { optimai_tables } from '../utils/axios';
import { FIELD_TYPES } from './databases/fields/utils/fieldTypes';

function TableAutocomplete({ value, onChange }) {
  const account = useSelector(selectAccount);
  const [selectedBase, setSelectedBase] = useState(null);
  const [filteredTables, setFilteredTables] = useState([]);
  const [tableFields, setTableFields] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [copySnackbar, setCopySnackbar] = useState({ open: false, fieldName: '' });

  console.log('tableFields', tableFields);
  // Fetch table fields from backend
  const fetchTableFields = useCallback(async (tableId) => {
    if (!tableId) return;
    setIsLoadingFields(true);
    try {
      const response = await optimai_tables.get(`/table/${tableId}`);
      const table = response.data.table;
      if (table && table.fields) {
        setTableFields(table.fields.items || []);
      }
    } catch (error) {
      console.error('Error fetching table fields:', error);
      setTableFields([]);
    } finally {
      setIsLoadingFields(false);
    }
  }, []);

  // Extract bases from account
  const bases = useMemo(() => account?.bases || [], [account]);

  // Get the current table's base id when component loads or value changes
  useEffect(() => {
    if (value && bases.length > 0) {
      // Find which base contains this table
      for (const base of bases) {
        const tableExists = base.tables?.items?.some((table) => table.id === value);
        if (tableExists) {
          setSelectedBase(base);
          fetchTableFields(value);
          break;
        }
      }
    } else {
      // Clear fields if no table is selected
      setTableFields([]);
    }
  }, [value, bases, fetchTableFields]);

  // Update filtered tables when base changes
  useEffect(() => {
    if (selectedBase) {
      setFilteredTables(
        (selectedBase.tables?.items || []).map((table) => ({
          details: { ...table, base_id: selectedBase.id },
          resource_type_id: 'table',
        })),
      );
    } else {
      setFilteredTables([]);
    }
  }, [selectedBase]);

  const handleBaseChange = (event, newBase) => {
    setSelectedBase(newBase);
    onChange(null); // Clear table selection when base changes
    setTableFields([]); // Clear fields when base changes
  };

  const handleTableChange = (event, newValue) => {
    // Log the selected table when it changes
    console.log('Selected table:', newValue);
    const tableId = newValue?.details?.id ?? null;
    onChange(tableId);
    if (tableId) {
      fetchTableFields(tableId);
    } else {
      setTableFields([]);
    }
  };

  // Copy field to clipboard
  const copyFieldToClipboard = (fieldName) => {
    navigator.clipboard
      .writeText(fieldName)
      .then(() => {
        console.log(`Copied ${fieldName} to clipboard`);
        setCopySnackbar({ open: true, fieldName });
        setTimeout(() => setCopySnackbar({ open: false, fieldName: '' }), 2000);
      })
      .catch((err) => {
        console.error('Error copying to clipboard:', err);
      });
  };

  // Get color based on field type
  const getFieldColor = (fieldType) => {
    const colorMap = {
      email: '#4caf50',
      singleLineText: '#2196f3',
      multiLineText: '#03a9f4',
      longText: '#03a9f4',
      singleSelect: '#9c27b0',
      multipleSelect: '#673ab7',
      multiSelect: '#673ab7',
      number: '#ff9800',
      date: '#795548',
      checkbox: '#607d8b',
      attachment: '#795548',
      reference: '#e91e63',
      url: '#009688',
      phone: '#cddc39',
      json: '#424242',
      user: '#3f51b5',
      rating: '#ffc107',
      trigger: '#f44336',
    };
    return colorMap[fieldType] || '#9e9e9e';
  };

  // Get icon component for field type
  const getFieldIcon = (fieldType) => {
    const fieldTypeObj = FIELD_TYPES.find((type) => type.id === fieldType);
    if (fieldTypeObj && fieldTypeObj.icon) {
      const IconComponent = fieldTypeObj.icon;
      return <IconComponent fontSize="small" />;
    }
    return null;
  };

  const selectedValue = useMemo(() => {
    const found = filteredTables?.find((table) => table.details?.id === value) || null;
    // If found, log the selected table details
    if (found) {
      console.log('Selected table value:', found);
    }
    return found;
  }, [filteredTables, value]);

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{ width: '100%' }}
    >
      <Autocomplete
        options={bases || []}
        getOptionLabel={(option) => option?.name || ''}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        value={selectedBase}
        renderOption={(props, option) => (
          <li
            key={option?.id}
            {...props}
          >
            {option?.name || ''}
          </li>
        )}
        onChange={handleBaseChange}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Select Base"
            variant="filled"
            placeholder="Choose a base first..."
          />
        )}
        blurOnSelect
        clearOnBlur={false}
        selectOnFocus
      />

      <Autocomplete
        options={filteredTables || []}
        getOptionLabel={(option) => option?.details?.name || ''}
        isOptionEqualToValue={(option, value) => option?.details?.id === value?.details?.id}
        value={selectedValue}
        renderOption={(props, option) => (
          <li
            key={option?.details?.id}
            {...props}
          >
            {option?.details?.name || ''}
          </li>
        )}
        onChange={handleTableChange}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Select Table"
            variant="filled"
            placeholder={selectedBase ? 'Choose a table...' : 'Select a base first'}
            disabled={!selectedBase}
          />
        )}
        blurOnSelect
        clearOnBlur={false}
        selectOnFocus
        disabled={!selectedBase}
      />

      {/* Table Fields Section */}
      {value && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1 }}
          >
            Table Fields{' '}
            {isLoadingFields && (
              <CircularProgress
                size={16}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {isLoadingFields ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : tableFields.length > 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.75,
                maxHeight: '200px',
                overflow: 'auto',
              }}
            >
              {tableFields.map((field) => (
                <Tooltip
                  key={field.id || field.db_field_name}
                  title={
                    <Box>
                      <Typography
                        variant="caption"
                        display="block"
                      >
                        Field: <strong>{field.name}</strong>
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                      >
                        DB Name: <strong>{field.db_field_name}</strong>
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                      >
                        Type: {field.type || field.db_field_type}
                      </Typography>
                      {field.is_primary && (
                        <Typography
                          variant="caption"
                          display="block"
                        >
                          Primary Key
                        </Typography>
                      )}
                      {field.not_null && (
                        <Typography
                          variant="caption"
                          display="block"
                        >
                          Required
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="lightgrey"
                        display="block"
                      >
                        (Click to copy DB field name)
                      </Typography>
                    </Box>
                  }
                  placement="top"
                >
                  <Chip
                    size="small"
                    icon={getFieldIcon(field.type || field.db_field_type)}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                        {field.not_null && (
                          <Box
                            component="span"
                            sx={{
                              color: 'red',
                              fontWeight: 'bold',
                              marginRight: '4px',
                              fontSize: '14px',
                            }}
                          >
                            *
                          </Box>
                        )}
                        {field.db_field_name || field.name}
                        {field.is_primary && (
                          <Box
                            component="span"
                            sx={{
                              ml: 0.5,
                              bgcolor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              borderRadius: '50%',
                              width: '14px',
                              height: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              fontWeight: 'bold',
                            }}
                          >
                            P
                          </Box>
                        )}
                      </Box>
                    }
                    onClick={() => copyFieldToClipboard(field.db_field_name)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: getFieldColor(field.type || field.db_field_type),
                      color: 'white',
                      fontWeight: field.is_primary ? 'bold' : 'normal',
                      height: '24px',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: (theme) => theme.palette.primary.contrastText,
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Paper>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No fields available for this table.
            </Typography>
          )}
        </Box>
      )}

      {/* Snackbar notification when a field is copied */}
      <Snackbar
        open={copySnackbar.open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        onClose={() => setCopySnackbar({ open: false, fieldName: '' })}
      >
        <Alert
          onClose={() => setCopySnackbar({ open: false, fieldName: '' })}
          severity="success"
          sx={{ width: '100%' }}
        >
          Copied <strong>{copySnackbar.fieldName}</strong> to clipboard
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default memo(TableAutocomplete);
