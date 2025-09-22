import Clarity from '@microsoft/clarity';
import PropTypes from 'prop-types';
import { useState, useEffect, memo, useMemo, createContext, useContext } from 'react';
import { batch } from 'react-redux';
import { Redirect, useLocation, useHistory } from 'react-router-dom';

// components
import { useAuthContext } from './useAuthContext';
import { analytics } from '../lib/analytics';
//
import Login from '../pages/auth/LoginPage.jsx';
import HermesWebSocketProvider from '../providers/websocket/HermesWebSocketProvider.jsx';
import WebSocketProvider from '../providers/websocket/WebSocketProvider.jsx';
import { setAccount, setAccounts, setUser } from '../redux/slices/general';
import { dispatch } from '../redux/store';
import { optimai } from '../utils/axios.js';
import localStorageAvailable from '../utils/localStorageAvailable';

// Create a context for authentication requirements
const AuthRequirementContext = createContext({
  requireAuth: () => {},
  isAuthenticated: false,
  showLoginModal: false,
  setShowLoginModal: () => {},
});

// Custom hook to use authentication requirement context
export const useAuthRequirement = () => {
  const context = useContext(AuthRequirementContext);
  if (!context) {
    throw new Error('useAuthRequirement must be used within AuthGuard');
  }
  return context;
};

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
  requireAuth: PropTypes.bool, // New prop to control if this route requires authentication
};

function AuthGuard({ children, requireAuth = false }) {
  const location = useLocation();
  const history = useHistory();
  const { isAuthenticated, isInitialized, user, logout } = useAuthContext();

  const { pathname } = location;

  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  const [requestedLocation, setRequestedLocation] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const storageAvailable = localStorageAvailable();

  const accounts = useMemo(() => !!user?.accounts && user.accounts, [user?.accounts]);

  // Function to trigger authentication requirement
  const handleRequireAuth = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isAuthenticated && accounts && user && !user.is_disabled) {
      if (!accounts.length) {
        logout();
        window.location.href = '/';
      }
      let selectedAccount = null;
      if (searchParams.has('acc')) {
        selectedAccount = accounts.find((elem) => elem.id === searchParams.get('acc'));
        if (selectedAccount) {
          searchParams.delete('acc');
          setSearchParams(searchParams);
          localStorage.setItem('OAIPTACC', selectedAccount.id);
        }
      }
      if (!selectedAccount && storageAvailable) {
        const storageAccount = localStorage.getItem('OAIPTACC');
        if (!!storageAccount) {
          selectedAccount = accounts.find((elem) => elem.id === storageAccount);
          if (!selectedAccount) {
            localStorage.removeItem('OAIPTACC');
          }
        }
      }
      if (!selectedAccount) {
        selectedAccount = accounts[0];
      }
      batch(() => {
        dispatch(setUser(user));
        dispatch(setAccounts(accounts));
        dispatch(setAccount(selectedAccount));
      });

      // Close login modal if user successfully authenticates
      setShowLoginModal(false);
    }
  }, [isAuthenticated, accounts, user]);

  useEffect(() => {
    if (isAuthenticated && user && !user.is_disabled) {
      // Check if user just completed registration (for web flow)
      const wasRegistering = localStorage.getItem('altan_registration_in_progress');
      
      // Identify user in Microsoft Clarity
      Clarity.identify(
        user.id.toString(), // required: unique user ID
        undefined, // optional: session ID
        undefined, // optional: page ID
        `${user.email}`, // optional: friendly name
      );

      // If user was in registration flow, alias them first
      if (wasRegistering === 'true') {
        // Alias the user to link anonymous session to known user
        analytics.alias(user.email, user.id);
        
        // Clear the flag
        localStorage.removeItem('altan_registration_in_progress');
      }

      // Identify user in PostHog
      analytics.identify(user.id, {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        method: 'auth_guard_session',
        is_superadmin: user.xsup,
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Handle invitation flow when user is authenticated
    if (isAuthenticated && searchParams.has('iid')) {
      const invitationId = searchParams.get('iid');
      // Call the accept invitation endpoint
      optimai
        .get(`/org/invitation/${invitationId}/accept`)
        .then((response) => {
          // Redirect to the URL returned by the backend
          if (response.data?.url) {
            window.location.href = response.data.url;
          }
        })
        .catch((error) => {
          // Handle errors - possibly redirect to error page
          if (error.response?.data?.url) {
            window.location.href = error.response.data.url;
          }
        });
    }
  }, [isAuthenticated, searchParams]);

  if (!isInitialized) {
    return null;
  }

  // Handle authenticated users with special states
  if (isAuthenticated && user) {
    if (user.is_banned) {
      window.location.href = 'https://altan.ai';
      return null;
    }

    if (user.is_disabled) {
      window.location.href = `https://waitlist.altanlabs.com?email=${encodeURIComponent(user.email)}`;
      return null;
    }

    if (requestedLocation && pathname !== requestedLocation) {
      setRequestedLocation(null);
      return <Redirect to={requestedLocation} />;
    }
  }

  // If authentication is required for this route and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Login />;
  }

  // Show login modal if triggered by user action
  if (showLoginModal && !isAuthenticated) {
    return (
      <>
        <AuthRequirementContext.Provider
          value={{
            requireAuth: handleRequireAuth,
            isAuthenticated,
            showLoginModal,
            setShowLoginModal,
          }}
        >
          {isAuthenticated ? <HermesWebSocketProvider><WebSocketProvider>{children}</WebSocketProvider></HermesWebSocketProvider> : children}
        </AuthRequirementContext.Provider>
        <Login
          onClose={() => setShowLoginModal(false)}
          modal
        />
      </>
    );
  }

  // Provide context and render children
  return (
    <AuthRequirementContext.Provider
      value={{
        requireAuth: handleRequireAuth,
        isAuthenticated,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {isAuthenticated ? (
        <HermesWebSocketProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </HermesWebSocketProvider>
      ) : (
        children
      )}
    </AuthRequirementContext.Provider>
  );
}

export default memo(AuthGuard);
