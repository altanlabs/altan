// @mui
import { Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';

// routes
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// _mock_
// components
import Profile from '../../components/profile/Profile';
import { useSettingsContext } from '../../components/settings';
import { CompactLayout } from '../../layouts/dashboard';

// ----------------------------------------------------------------------

export default function UserProfilePage() {
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>Profile · Altan</title>
      </Helmet>
      <CompactLayout>
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <Profile />
        </Container>
      </CompactLayout>
    </>
  );
}
