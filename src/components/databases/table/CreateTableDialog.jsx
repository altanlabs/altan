import { Stack, DialogActions } from '@mui/material';
import { useCallback, memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { createTable } from '../../../redux/slices/bases.ts';
import formatData from '../../../utils/formatData';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import InteractiveButton from '../../buttons/InteractiveButton';
import CustomDialog from '../../dialogs/CustomDialog.jsx';
import FormParameter from '../../tools/form/FormParameter';

const TABLE_CREATE_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Table name',
      'x-hide-label': true,
    },
  },
  required: ['name'],
};

const CreateTableDialog = ({ baseId, open, onClose }) => {
  const methods = useForm({ defaultValues: {} });
  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      const formattedData = {
        name: formatData(data, TABLE_CREATE_SCHEMA.properties).name,
        comment: null,
        // Note: schema will be set to tenant_{base_id} automatically in createTable thunk
      };

      dispatchWithFeedback(createTable(baseId, formattedData), {
        useSnackbar: true,
        successMessage: 'Table created successfully',
        errorMessage: 'Could not create table',
      }).then(() => onClose());
    }),
    [baseId, onClose],
  );

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <Stack
        direction="row"
        alignItems="center"
        padding={2}
      >
        <CardTitle>Create Table</CardTitle>
      </Stack>
      <FormProvider {...methods}>
        <Stack
          padding={2}
          spacing={1}
        >
          {Object.entries(TABLE_CREATE_SCHEMA.properties).map(([key, fieldSchema]) => {
            const required = TABLE_CREATE_SCHEMA.required.includes(key);
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
        <DialogActions>
          <InteractiveButton
            icon="mdi:check"
            title="Create Table"
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

export default memo(CreateTableDialog);
