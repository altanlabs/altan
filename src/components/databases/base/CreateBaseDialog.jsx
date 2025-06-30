/* eslint-disable react-hooks/exhaustive-deps */
import { Stack, DialogActions } from '@mui/material';
import { useCallback, memo, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateAltanerComponentById } from '../../../redux/slices/altaners';
import { createBase, updateBaseById } from '../../../redux/slices/bases';
import formatData from '../../../utils/formatData';
import { CardTitle } from '../../aceternity/cards/card-hover-effect.tsx';
import InteractiveButton from '../../buttons/InteractiveButton.jsx';
import CustomDialog from '../../dialogs/CustomDialog.jsx';
import FormParameter from '../../tools/form/FormParameter.jsx';

const getBaseCreateSchema = (altanerComponentId) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Base name',
      'x-hide-label': true,
    },
    ...(altanerComponentId && {
      prompt: {
        type: 'string',
        description: 'Describe the structure of your base',
        title: 'Generate with AI ✨',
        'x-hide-label': true,
        'x-multiline': true,
        'x-component': 'CreateWithAI',
      },
    }),
    // icon: {
    //   type: 'string',
    //   description: 'Base icon',
    //   'x-hide-label': true,
    //   'x-component': 'IconAutocomplete',
    // }
  },
  required: ['name'],
});

const CreateBaseDialog = ({
  open,
  onClose,
  baseToEdit = null,
  altanerId = null,
  altanerComponentId = null,
  redirect = true,
}) => {
  const history = useHistory();;
  const methods = useForm({
    defaultValues: baseToEdit
      ? {
          name: baseToEdit.name,
          icon: baseToEdit.icon,
        }
      : {
          name: 'My base',
          icon: 'material-symbols:database',
        },
  });
  const { handleSubmit } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const schema = useMemo(() => getBaseCreateSchema(altanerComponentId), [altanerComponentId]);

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      const formattedData = formatData(data, schema.properties);

      if (baseToEdit) {
        dispatchWithFeedback(updateBaseById(baseToEdit.id, formattedData), {
          useSnackbar: true,
          successMessage: 'Base updated successfully',
          errorMessage: 'Could not update base',
        }).then(() => {
          onClose();
        });
      } else {
        dispatchWithFeedback(createBase(formattedData, altanerComponentId), {
          useSnackbar: true,
          successMessage: 'Base created successfully',
          errorMessage: 'Could not create base',
        }).then((base) => {
          if (!altanerComponentId) {
            onClose(base.id);
            if (!!redirect) {
              history.push(`/bases/${base.id}`);
            }
          } else {
            dispatchWithFeedback(
              updateAltanerComponentById(altanerComponentId, {
                ids: [base.id],
                method: 'insert',
              }),
              {
                successMessage: 'Base created and component updated successfully',
                errorMessage: 'There was an error updating the component',
                useSnackbar: true,
                useConsole: {
                  error: true,
                },
              },
            ).then(() =>
              history.push(`/altaners/${altanerId}/c/${altanerComponentId}/b/${base.id}`),
            );
          }
        });
      }
    }),
    [
      onClose,
      history,
      baseToEdit,
      altanerComponentId,
      redirect,
      dispatchWithFeedback,
      schema.properties,
    ],
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
        <CardTitle>{baseToEdit ? 'Edit Base' : 'Create Base'}</CardTitle>
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
        </Stack>
        <DialogActions>
          <InteractiveButton
            icon="mdi:check"
            title="Create Base"
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

export default memo(CreateBaseDialog);
