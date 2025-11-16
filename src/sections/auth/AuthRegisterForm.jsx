import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Stack, IconButton, InputAdornment, Alert, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// form
// @mui

// auth
import { useAuthContext } from '../../auth/useAuthContext.ts';
// components
import FormProvider, { RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

export default function AuthRegisterForm({ invitation, idea }) {
  // console.log("idea", idea)
  const { register } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: invitation?.email || '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (invitation?.email) {
      setValue('email', invitation.email);
    }
  }, [invitation, setValue]);

  const onSubmit = async (data) => {
    try {
      if (register) {
        await register(
          data.email,
          data.password,
          data.firstName,
          data.lastName,
          invitation?.id,
          idea,
        );

        if (typeof window !== 'undefined' && window.fbq) {
          try {
            window.fbq('track', 'CompleteRegistration');
          } catch (e) {}
        }
      }
    } catch (error) {
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.response.data.detail || error,
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
          sx={{ 
            minWidth: { xs: 280, sm: 300 }, // Smaller min width on mobile
            width: '100%',
          }}
        >
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

          {/* Email first - always visible */}
          <RHFTextField
            size="small"
            name="email"
            label="Email address"
            variant="filled"
            disabled={!!invitation?.email}
            autoComplete="email"
          />

          {/* Name fields */}
          <Stack
            direction="row"
            spacing={1}
          >
            <RHFTextField
              size="small"
              name="firstName"
              label="First name"
              variant="filled"
              autoComplete="given-name"
            />
            <RHFTextField
              size="small"
              name="lastName"
              label="Last name"
              variant="filled"
              autoComplete="family-name"
            />
          </Stack>

          {/* Password */}
          <RHFTextField
            size="small"
            name="password"
            label="Password"
            variant="filled"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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
            color="inherit"
            size="medium"
            type="submit"
            variant="contained"
            loading={isSubmitting || isSubmitSuccessful}
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
            Get started free
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  );
}
