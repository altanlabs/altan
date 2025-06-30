import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Stack, Card } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// form
// @mui

// components
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import { changeUserPassword } from '../../../../redux/slices/user';
import { dispatch } from '../../../../redux/store';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().optional('Old Password is required'),
    newPassword: Yup.string()
      .required('New Password is required')
      .min(8, 'Password must be at least 8 characters')
      .test(
        'no-match',
        'New password must be different than old password',
        (value, { parent }) => value !== parent.oldPassword,
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    // console.log('DATA', data);
    try {
      dispatch(
        changeUserPassword({
          old_password: data.oldPassword,
          password: data.newPassword,
          password_rep: data.confirmNewPassword,
        }),
      ).then((email) => {
        enqueueSnackbar(`Updated password for ${email} successfully!`);
        reset();
      });
    } catch (error) {
      // console.error(error);
      enqueueSnackbar('Could not update password!', {
        variant: 'error',
      });
    }
  };

  return (
    <FormProvider methods={methods}>
      <Card>
        <Stack
          spacing={3}
          alignItems="flex-end"
          sx={{ p: 3 }}
        >
          <RHFTextField
            name="oldPassword"
            type="password"
            label="Old Password"
          />

          <RHFTextField
            name="newPassword"
            type="password"
            label="New Password"
            helperText={
              <Stack
                component="span"
                direction="row"
                alignItems="center"
              >
                <Iconify
                  icon="eva:info-fill"
                  width={16}
                  sx={{ mr: 0.5 }}
                />{' '}
                Password must be minimum 8+
              </Stack>
            }
          />

          <RHFTextField
            name="confirmNewPassword"
            type="password"
            label="Confirm New Password"
          />

          <LoadingButton
            fullWidth
            variant="soft"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
