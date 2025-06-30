import { memo } from 'react';
import { Navigate, Outlet } from 'react-router';

import Header from './header/Header';
import { useAuthContext } from '../../auth/useAuthContext';
import { NavigationPromptProvider } from '../../pages/dashboard/superadmin/providers/NavigationConfirmProvider';

const SuperAdminLayout = () => {
  const { user } = useAuthContext();

  if (!user.xsup) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Header />
      <NavigationPromptProvider>
        <Outlet />
      </NavigationPromptProvider>
    </>
  );
};

export default memo(SuperAdminLayout);
