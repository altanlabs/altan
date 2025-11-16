import { Stack, DialogActions, Switch, FormControlLabel } from '@mui/material';
import { useCallback, memo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { duplicateBase } from '../../../redux/slices/bases.ts';
import formatData from '../../../utils/formatData';
import { CardTitle } from '../../aceternity/cards/card-hover-effect.tsx';
import InteractiveButton from '../../buttons/InteractiveButton.jsx';
import CustomDialog from '../../dialogs/CustomDialog.jsx';
import FormParameter from '../../tools/form/FormParameter.jsx';

const getDuplicateBaseSchema = () => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'New base name',
      'x-hide-label': true,
    },
  },
  required: ['name'],
});

const DuplicateBaseDialog = ({ open, onClose, baseToClone = null, redirect = true }) => {
  const history = useHistory();;
  const [copyRecords, setCopyRecords] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: baseToClone ? `${baseToClone.name} (Copy)` : 'Copy of base',
    },
  });

  const { handleSubmit } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const schema = getDuplicateBaseSchema();

  const handleCopyRecordsChange = (event) => {
    setCopyRecords(event.target.checked);
  };

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      if (!baseToClone) {
        onClose();
        return;
      }

      const formattedData = formatData(data, schema.properties);
      const duplicateData = {
        original_base_id: baseToClone.id,
        target_account_id: baseToClone.account_id,
        name: formattedData.name,
        copy_records: copyRecords,
      };

      dispatchWithFeedback(duplicateBase(duplicateData), {
        useSnackbar: true,
        successMessage: 'Base duplicated successfully',
        errorMessage: 'Could not duplicate base',
      }).then((base) => {
        onClose();
        if (redirect && base?.id) {
          history.push(`/bases/${base.id}`);
        }
      });
    }),
    [
      baseToClone,
      copyRecords,
      dispatchWithFeedback,
      history,
      onClose,
      redirect,
      schema.properties,
    ],
  );

  if (!baseToClone) {
    return null;
  }

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
        <CardTitle>Duplicate Base</CardTitle>
      </Stack>
      <FormProvider {...methods}>
        <Stack
          padding={2}
          spacing={1}
        >
          {Object.entries(schema.properties).map(([key, fieldSchema]) => {
            const required = schema.required.includes(key);
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
          <FormControlLabel
            control={
              <Switch
                checked={copyRecords}
                onChange={handleCopyRecordsChange}
                name="copyRecords"
                color="primary"
              />
            }
            label="Copy records"
          />
        </Stack>
        <DialogActions>
          <InteractiveButton
            icon="mdi:copy"
            title="Duplicate Base"
            onClick={onSubmit}
            duration={8000}
            containerClassName="h-[40]"
            borderClassName="h-[80px] w-[250px]"
            enableBorder={true}
            loading={isSubmitting}
          />
        </DialogActions>
      </FormProvider>
    </CustomDialog>
  );
};

export default memo(DuplicateBaseDialog);
