import { Stack, DialogActions } from '@mui/material';
import { useCallback, memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { createTableRecord, selectFieldsByTableId } from '../../../redux/slices/bases.ts';
import formatData from '../../../utils/formatData';
import InteractiveButton from '../../buttons/InteractiveButton';
import CustomDialog from '../../dialogs/CustomDialog.jsx';
import FormParameter from '../../tools/form/FormParameter';

const CreateRecordDialog = ({ baseId, tableId, open, onClose }) => {
  const methods = useForm({ defaultValues: {} });
  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  // Use the proper selector to get fields
  const fields = useSelector((state) => selectFieldsByTableId(state, baseId, tableId));

  // Dynamically create schema from fields
  const recordSchema = {
    type: 'object',
    properties: fields.reduce((acc, field) => {
      acc[field.db_field_name] = {
        type: getSchemaType(field.type),
        description: field.name,
        'x-field-type': field.type,
        'x-field-options': field.options,
      };
      return acc;
    }, {}),
    required: fields.filter((field) => field.is_required).map((field) => field.name.toLowerCase()),
  };

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      // New API expects plain object, not wrapped in records array
      const formattedData = formatData(data, recordSchema.properties);

      dispatchWithFeedback(createTableRecord(baseId, tableId, formattedData), {
        useSnackbar: true,
        successMessage: 'Record created successfully',
        errorMessage: 'Could not create record',
      }).then(() => onClose());
    }),
    [baseId, tableId, onClose, recordSchema],
  );

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <Stack
          padding={2}
          spacing={1}
        >
          {Object.entries(recordSchema.properties).map(([key, fieldSchema]) => {
            const required = recordSchema.required.includes(key);
            return (
              <FormParameter
                key={key}
                fieldKey={key}
                schema={fieldSchema}
                required={required}
                enableLexical={false}
              />
            );
          })}
        </Stack>
        <DialogActions className="sticky-dialog-actions">
          <InteractiveButton
            icon="mdi:check"
            title="Create Record"
            onClick={onSubmit}
            duration={8000}
            containerClassName="h-[40]"
            borderClassName="h-[80px] w-[250px]"
            enableBorder={true}
            loading={isSubmitting}
            disabled={!isDirty}
          />
        </DialogActions>
      </FormProvider>
    </CustomDialog>
  );
};

// Helper function to map field types to JSON schema types
const getSchemaType = (fieldType) => {
  switch (fieldType) {
    case 'number':
    case 'rating':
      return 'number';
    case 'checkbox':
      return 'boolean';
    case 'date':
      return 'string';
    case 'reference':
      return 'array';
    default:
      return 'string';
  }
};

export default memo(CreateRecordDialog);
