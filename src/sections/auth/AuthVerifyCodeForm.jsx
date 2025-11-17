import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import FormProvider, { RHFCodes } from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';
import { LoadingButton } from '../../components/ui/loading-button';

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

  const hasError = !!errors.code1 || !!errors.code2 || !!errors.code3 || 
                   !!errors.code4 || !!errors.code5 || !!errors.code6;

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleFormSubmit}
    >
      <form onSubmit={handleFormSubmit} className="w-full space-y-6">
        <RHFCodes
          keyName="code"
          inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']}
        />

        {hasError && (
          <p className="text-sm text-destructive text-center">
            Code is required
          </p>
        )}

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          className="w-full h-11"
          size="lg"
        >
          Verify
        </LoadingButton>
      </form>
    </FormProvider>
  );
}
