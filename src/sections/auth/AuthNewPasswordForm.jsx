import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Stack, IconButton, InputAdornment, FormHelperText } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
// form
// @mui

// routes
import FormProvider, { RHFTextField, RHFCodes } from '../../components/hook-form';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import { PATH_AUTH } from '../../routes/paths';
// components
import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

export default function AuthNewPasswordForm() {
  const history = useHistory();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  
  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);

  // Get email and code from URL params
  const emailFromUrl = searchParams.get('email');
  const codeFromUrl = searchParams.get('code') || '';
  const codeDigits = codeFromUrl.split('');

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required'),
    code2: Yup.string().required('Code is required'),
    code3: Yup.string().required('Code is required'),
    code4: Yup.string().required('Code is required'),
    code5: Yup.string().required('Code is required'),
    code6: Yup.string().required('Code is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const defaultValues = {
    code1: codeDigits[0] || '',
    code2: codeDigits[1] || '',
    code3: codeDigits[2] || '',
    code4: codeDigits[3] || '',
    code5: codeDigits[4] || '',
    code6: codeDigits[5] || '',
    email: emailFromUrl || '', // Set email from URL
    password: '',
    confirmPassword: '',
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
      const verificationCode = `${data.code1}${data.code2}${data.code3}${data.code4}${data.code5}${data.code6}`;

      await optimai.post(`/user/reset-password?verification_id=${verificationCode}`, {
        password: data.password,
        password_rep: data.confirmPassword,
      });

      sessionStorage.removeItem('email-recovery');
      enqueueSnackbar('Password changed successfully!');
              history.push(PATH_AUTH.login);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.response?.data?.detail || 'Failed to reset password', {
        variant: 'error',
      });
    }
  };

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(onSubmit)}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <RHFTextField
            name="email"
            label="Email"
            value={emailFromUrl} // Set the value
            disabled // Disable the field
            InputLabelProps={{ shrink: true }} // Keep the label visible
            defaultValue={emailFromUrl} // Set default value
          />

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

          <RHFTextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <RHFTextField
            name="confirmPassword"
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ mt: 3 }}
          >
            Update Password
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
}
