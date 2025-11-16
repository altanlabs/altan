import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

// routes
import { useAuthContext } from './useAuthContext.ts';
import LoadingScreen from '../components/loading-screen';
import { PATH_DASHBOARD } from '../routes/paths';
// components
//

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node,
};

export default function GuestGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuthContext();

  if (isAuthenticated) {
    return <Redirect to={PATH_DASHBOARD.general.dashboard} />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <> {children} </>;
}
