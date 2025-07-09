import { LoadingButton } from '@mui/lab';
import { Button, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import CustomDialog from './dialogs/CustomDialog';
import FormParameter from './tools/form/FormParameter';

const DEFAULTS_BY_TYPE = {
  object: {},
  array: [],
  string: null,
  boolean: false,
  integer: null,
  number: null,
};

const FormDialog = ({
  open,
  onClose,
  schema,
  title = 'Dialog',
  description = 'description',
  onConfirm = null,
}) => {
  const renderSettingsFields = useMemo(
    () =>
      Object.entries(schema.properties ?? {}).map(([key, propertySchema]) => (
        <FormParameter
          key={key}
          fieldKey={key}
          schema={propertySchema}
          required={key in schema.required}
        />
      )),
    [schema],
  );

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      is_active: false,
      meta_data: {},
      member_id: null,
    },
  });
  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = methods;

  const onSubmit = useCallback(
    handleSubmit(async (data) => onConfirm(data)),
    [handleSubmit],
  );

  const defaults = useMemo(
    () =>
      Object.entries(schema.properties ?? {}).reduce((obj, [key, value]) => {
        obj[key] = value.default ?? DEFAULTS_BY_TYPE[value.type];
        return obj;
      }, {}),
    [schema],
  );

  useEffect(() => {
    if (open) {
      reset(defaults);
    }
  }, [defaults, reset, open]);

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      fullWidth
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography variant="caption">{description}</Typography>
        <FormProvider {...methods}>{renderSettingsFields}</FormProvider>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="error"
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={onSubmit}
          color="inherit"
          variant="soft"
          disabled={!isDirty}
        >
          Confirm
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(FormDialog);
