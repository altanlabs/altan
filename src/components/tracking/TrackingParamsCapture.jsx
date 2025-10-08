import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../auth/useAuthContext';
import { captureTrackingParamsFromURL } from '../../utils/queryParams';

/**
 * Component that captures and stores tracking params for unauthenticated users
 * Should be placed high in the component tree (e.g., in Router or App)
 */
const TrackingParamsCapture = () => {
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAuthContext();

  useEffect(() => {
    // Only proceed if auth is initialized
    if (!isInitialized) {
      return;
    }

    // Only capture for unauthenticated users
    if (!isAuthenticated) {
      captureTrackingParamsFromURL(isAuthenticated);
    }
  }, [location.search, isAuthenticated, isInitialized]);

  return null; // This component doesn't render anything
};

export default TrackingParamsCapture;
