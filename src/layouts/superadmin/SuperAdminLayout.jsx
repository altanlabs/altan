import { memo } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import Header from './header/Header';
import { useAuthContext } from '../../auth/useAuthContext';
import { NavigationPromptProvider } from '../../pages/dashboard/superadmin/providers/NavigationConfirmProvider';

const SuperAdminLayout = ({ children }) => {
  const { user } = useAuthContext();

  if (!user.xsup) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Header />
      <NavigationPromptProvider>
        {children}
      </NavigationPromptProvider>
    </>
  );
};

SuperAdminLayout.propTypes = {
  children: PropTypes.node,
};

export default memo(SuperAdminLayout);
