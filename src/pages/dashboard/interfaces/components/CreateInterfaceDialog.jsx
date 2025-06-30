/* eslint-disable react-hooks/exhaustive-deps */
import { Stack, DialogActions } from '@mui/material';
import { useCallback, memo, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { updateAltanerComponentById } from '@redux/slices/altaners';

import InteractiveButton from '../../../../components/buttons/InteractiveButton.jsx';
import CustomDialog from '../../../../components/dialogs/CustomDialog.jsx';
import FormParameter from '../../../../components/tools/form/FormParameter.jsx';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch.js';
import { createInterface, updateInterfaceById } from '../../../../redux/slices/general.js';
import formatData from '../../../../utils/formatData.js';

const getInterfaceCreateSchema = (altanerComponentId, interfaceToEdit) => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Interface name',
      'x-hide-label': true,
    },
    // Only show these fields when creating new interface
    ...(!interfaceToEdit && {
      // prompt: {
      //   type: 'string',
      //   description: 'Describe the structure of your interface',
      //   title: 'Generate with AI ✨',
      //   'x-hide-label': true,
      //   'x-multiline': true,
      //   'x-component': 'CreateWithAI',
      // },
      framework: {
        type: 'string',
        title: 'Framework',
        'x-hide-label': true,
        enum: ['vite', 'nextjs'],
      },
      github_repo_url: {
        type: 'string',
        title: 'GitHub Repository URL',
        'x-hide-label': true,
      },
    }),
  },
  required: ['name', 'framework'],
});

const CreateInterfaceDialog = ({
  open,
  onClose,
  interfaceToEdit = null,
  altanerId = null,
  altanerComponentId = null,
  redirect = true,
}) => {
  const history = useHistory();;
  const methods = useForm({
    defaultValues: interfaceToEdit
      ? {
          name: interfaceToEdit.name,
        }
      : {
          name: 'My interface',
        },
  });
  const { handleSubmit } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const schema = useMemo(
    () => getInterfaceCreateSchema(altanerComponentId, interfaceToEdit),
    [altanerComponentId, interfaceToEdit],
  );

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      const formattedData = formatData(data, schema.properties);
      if (interfaceToEdit) {
        dispatchWithFeedback(updateInterfaceById(interfaceToEdit.id, formattedData), {
          useSnackbar: true,
          successMessage: 'Interface updated successfully',
          errorMessage: 'Could not update interface',
        }).then(() => {
          onClose();
        });
      } else {
        dispatchWithFeedback(createInterface(formattedData), {
          useSnackbar: true,
          successMessage: 'Interface created successfully',
          errorMessage: 'Could not create interface',
        }).then((ui) => {
          if (!altanerComponentId) {
            onClose();
            history.push(`/interfaces/${ui.interface.id}`);
          } else {
            dispatchWithFeedback(
              updateAltanerComponentById(altanerComponentId, {
                ids: [ui.id],
                method: 'insert',
              }),
              {
                successMessage: 'Interface created and component updated successfully',
                errorMessage: 'There was an error updating the component',
                useSnackbar: true,
                useConsole: {
                  error: true,
                },
              },
            ).then(() =>
              history.push(`/altaners/${altanerId}/c/${altanerComponentId}/i/${ui.id}`, {
                replace: true,
              }),
            );
          }
        });
      }
    }),
    [
      onClose,
      history.push,
      interfaceToEdit,
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
        <a>{interfaceToEdit ? 'Edit Interface' : 'Create Interface'}</a>
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
            title={interfaceToEdit ? 'Save' : 'Create Interface'}
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

export default memo(CreateInterfaceDialog);
