// form
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Stack, FormHelperText } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

// routes
// components
import { useAuthContext } from '../../auth/useAuthContext.ts';
import FormProvider, { RHFCodes } from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';

// ----------------------------------------------------------------------

export default function AuthVerifyCodeForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { verifyEmail } = useAuthContext();

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required'),
    code2: Yup.string().required('Code is required'),
    code3: Yup.string().required('Code is required'),
    code4: Yup.string().required('Code is required'),
    code5: Yup.string().required('Code is required'),
    code6: Yup.string().required('Code is required'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const code = Object.values(data).join('');
      await verifyEmail(code);
      enqueueSnackbar('Email verified successfully!');
      window.location.href = '/';
    } catch (error) {
      enqueueSnackbar(error.message || 'Verification failed', { variant: 'error' });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleFormSubmit}
    >
      <form onSubmit={handleFormSubmit}>
        <Stack spacing={3}>
          <RHFCodes
            keyName="code"
            inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']}
          />

          {(!!errors.code1 ||
            !!errors.code2 ||
            !!errors.code3 ||
            !!errors.code4 ||
            !!errors.code5 ||
            !!errors.code6) && (
            <FormHelperText
              error
              sx={{ px: 2 }}
            >
              Code is required
            </FormHelperText>
          )}

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ mt: 3 }}
          >
            Verify
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
}
