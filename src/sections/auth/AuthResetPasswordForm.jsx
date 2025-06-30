// form
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
// @mui
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import FormProvider, { RHFTextField } from '../../components/hook-form';
import { useSnackbar } from '../../components/snackbar';
import { PATH_AUTH } from '../../routes/paths';
import { optimai } from '../../utils/axios';

// routes
// components

// ----------------------------------------------------------------------

export default function AuthResetPasswordForm() {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await optimai.get(`/user/forgot-password?email=${encodeURIComponent(data.email)}`);
      sessionStorage.setItem('email-recovery', data.email);
      enqueueSnackbar('Reset instructions sent to your email!');
              history.push(`${PATH_AUTH.newPassword}?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.detail || 'Something went wrong', { variant: 'error' });
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
        <RHFTextField
          name="email"
          label="Email address"
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Send Reset Link
        </LoadingButton>
      </form>
    </FormProvider>
  );
}
