// form
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Link, Stack, Alert, IconButton, InputAdornment, Divider } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import * as Yup from 'yup';

// routes
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/iconify';
import { PATH_AUTH } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function AuthLoginForm({ idea = null, invitation = null }) {
  const { login } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await login(
        {
          username: data.email,
          password: data.password,
        },
        idea,
        invitation,
      );
    } catch (error) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.response?.data?.detail || error.message || 'Login failed',
      });
    }
  };

  return (
    <FormProvider methods={methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Divider
          sx={{
            mb: 2,
            typography: 'overline',
            color: 'text.disabled',
            '&::before, ::after': {
              borderTopStyle: 'dashed',
            },
          }}
        >
          OR
        </Divider>

        <Stack
          spacing={1.5}
          sx={{ minWidth: 300 }}
        >
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

          {/* Email first - always visible */}
          <RHFTextField
            size="small"
            name="email"
            label="Email address"
            variant="filled"
            autoComplete="email"
          />

          <RHFTextField
            size="small"
            name="password"
            label="Password"
            variant="filled"
            type={showPassword ? 'text' : 'password'}
            autoComplete="password"
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

          <Stack
            alignItems="flex-end"
            sx={{ my: 1 }}
          >
            <Link
              component={RouterLink}
              to={PATH_AUTH.resetPassword}
              variant="body2"
              color="text.secondary"
              underline="always"
            >
              Forgot password?
            </Link>
          </Stack>

          <LoadingButton
            fullWidth
            color="inherit"
            size="medium"
            variant="contained"
            type="submit"
            loading={isSubmitSuccessful || isSubmitting}
            sx={{
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
              height: '48px',
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: 'text.primary',
                color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
              },
            }}
          >
            Login
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
}
