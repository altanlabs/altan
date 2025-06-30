// src/components/databases/fields/CreateFieldDialog.jsx
import {
  // Dialog,
  // DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
} from '@mui/material';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';

import FieldConfig from './configs/FieldConfig';
import { FIELD_TYPES } from './utils/fieldTypes';
import FieldTypeSelector from './utils/FieldTypeSelector';
import getDefaultConfig from './utils/getDefaultConfig';
import { RESERVED_WORDS } from './utils/reservedWords';
import { createField } from '../../../redux/slices/bases';
import CustomDialog from '../../dialogs/CustomDialog.jsx';

const CreateFieldDialog = ({ open, onClose, table }) => {
  const dispatch = useDispatch();
  const [selectedType, setSelectedType] = useState(null);
  const [fieldConfig, setFieldConfig] = useState({});
  const [fieldName, setFieldName] = useState('');
  const [fieldNameError, setFieldNameError] = useState('');

  const getFieldOptions = (type, config) => {
    switch (type) {
      case 'multiSelect':
      case 'singleSelect':
        return {
          select_options: config.select_options || [],
        };
      case 'reference':
        return {
          reference_options: {
            foreign_table: config.reference_options?.foreign_table || '',
            on_delete_mode: config.reference_options?.on_delete_mode || false,
          },
        };
      case 'checkbox':
        return {
          checkbox_options: {
            icon: config.checkbox_options?.icon || 'mdi:check',
            color: config.checkbox_options?.color || '#22C55E',
          },
        };
      case 'date':
      case 'dateTime':
        return {
          datetime_options: config.datetime_options,
        };
      case 'rating':
        return {
          rating_options: {
            icon: config.rating_options?.icon || 'mdi:star',
            color: config.rating_options?.color || '#EAB308',
            max_value: config.rating_options?.max_value || 5,
          },
        };
      default:
        return {};
    }
  };

  const validateFieldName = (name) => {
    if (!name.trim()) {
      return 'Field name is required';
    }
    if (RESERVED_WORDS.has(name.toLowerCase())) {
      return 'This name is reserved and cannot be used';
    }
    // Optional: Add additional validation rules here
    // e.g., check for special characters, start with letter, etc.
    return '';
  };

  const handleClose = () => {
    setSelectedType(null);
    setFieldConfig({});
    setFieldName('');
    onClose();
  };

  const handleCreate = () => {
    if (selectedType && !fieldNameError) {
      const fieldData = {
        name: fieldName,
        type: selectedType,
        options: getFieldOptions(selectedType, fieldConfig),
      };

      dispatch(createField(table, fieldData));
      handleClose();
    }
  };

  const handleTypeChange = (event, newValue) => {
    if (newValue) {
      setSelectedType(newValue.id);
      setFieldConfig(getDefaultConfig(newValue.id));
    }
  };

  const handleInitialTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setFieldConfig(getDefaultConfig(typeId));
  };

  const handleFieldNameChange = (e) => {
    const newName = e.target.value;
    setFieldName(newName);
    setFieldNameError(validateFieldName(newName));
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={handleClose}
    >
      {/* <DialogTitle className="text-lg font-semibold">
        {selectedType ? 'Configure field' : 'Create new field'}
      </DialogTitle> */}
      <DialogContent className="space-y-4 mt-6">
        {!selectedType ? (
          <FieldTypeSelector onSelect={handleInitialTypeSelect} />
        ) : (
          <>
            <TextField
              autoFocus
              fullWidth
              label="Field name"
              variant="filled"
              size="small"
              value={fieldName}
              onChange={handleFieldNameChange}
              error={!!fieldNameError}
              helperText={fieldNameError}
              className="mb-2"
            />
            <Autocomplete
              options={FIELD_TYPES}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => {
                const Icon = option.icon;
                return (
                  <li {...props}>
                    <Icon />
                    <span className="ml-2">{option.name}</span>
                  </li>
                );
              }}
              value={FIELD_TYPES.find((type) => type.id === selectedType) || null}
              onChange={handleTypeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Field type"
                  variant="filled"
                  size="small"
                />
              )}
              className="mb-4"
            />
            <FieldConfig
              type={selectedType}
              config={fieldConfig}
              onChange={setFieldConfig}
              tableId={table.id}
              baseId={table.base_id}
            />
          </>
        )}
      </DialogContent>
      <DialogActions className="space-x-2">
        <Button
          onClick={handleClose}
          className="text-gray-600"
        >
          Cancel
        </Button>
        {selectedType && (
          <Button
            onClick={handleCreate}
            variant="contained"
            color="primary"
            disabled={!fieldName.trim() || !!fieldNameError}
            className="bg-blue-600 text-white"
          >
            Create field
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(CreateFieldDialog);
