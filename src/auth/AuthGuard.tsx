import Clarity from '@microsoft/clarity';
import PropTypes from 'prop-types';
import { useState, useEffect, memo, useMemo, createContext, useContext, ReactNode } from 'react';
import { batch } from 'react-redux';
import { Redirect, useLocation, useHistory } from 'react-router-dom';

// components
import type { AuthRequirementContextType } from './types';
import { useAuthContext } from './useAuthContext';
import { analytics } from '../lib/analytics';
//
import Login from '../pages/auth/LoginPage.jsx';
import HermesWebSocketProvider from '../providers/websocket/HermesWebSocketProvider';
import { setAccount, setAccounts, setUser } from '../redux/slices/general/index';
import type { Account } from '../redux/slices/general/types/state';
import { dispatch } from '../redux/store';
import { optimai } from '../utils/axios.js';
import localStorageAvailable from '../utils/localStorageAvailable';

// Create a context for authentication requirements
const AuthRequirementContext = createContext<AuthRequirementContextType>({
  requireAuth: () => false,
  isAuthenticated: false,
  showLoginModal: false,
  setShowLoginModal: () => {},
});

// Custom hook to use authentication requirement context
export const useAuthRequirement = (): AuthRequirementContextType => {
  const context = useContext(AuthRequirementContext);
  if (!context) {
    throw new Error('useAuthRequirement must be used within AuthGuard');
  }
  return context;
};

// ----------------------------------------------------------------------

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // New prop to control if this route requires authentication
}

AuthGuard.propTypes = {
  children: PropTypes.node,
  requireAuth: PropTypes.bool,
};

function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const location = useLocation();
  const history = useHistory();
  const { isAuthenticated, isInitialized, user, logout } = useAuthContext();

  const { pathname } = location;

  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams: URLSearchParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const storageAvailable = localStorageAvailable();

  const accounts = useMemo(
    () => (!!user?.accounts && user.accounts),
    [user?.accounts]
  );

  // Function to trigger authentication requirement
  const handleRequireAuth = (): boolean => {
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
      let selectedAccount: Account | null = null;
      if (searchParams.has('acc')) {
        const accId = searchParams.get('acc');
        selectedAccount = accounts.find((elem) => elem.id === accId) || null;
        if (selectedAccount) {
          searchParams.delete('acc');
          setSearchParams(searchParams);
          localStorage.setItem('OAIPTACC', selectedAccount.id);
        }
      }
      if (!selectedAccount && storageAvailable) {
        const storageAccount = localStorage.getItem('OAIPTACC');
        if (!!storageAccount) {
          selectedAccount = accounts.find((elem) => elem.id === storageAccount) || null;
          if (!selectedAccount) {
            localStorage.removeItem('OAIPTACC');
          }
        }
      }
      if (!selectedAccount) {
        selectedAccount = accounts[0];
      }
      batch(() => {
        dispatch(setUser(user as any)); // Cast needed due to slight type mismatch between AuthUser and User
        dispatch(setAccounts(accounts));
        dispatch(setAccount(selectedAccount));
      });

      // Close login modal if user successfully authenticates
      setShowLoginModal(false);

      // Check for pending idea and redirect if exists
      const pendingIdeaId = sessionStorage.getItem('pendingIdeaId');
      if (pendingIdeaId) {
        sessionStorage.removeItem('pendingIdeaId');
        history.push(`/?idea=${pendingIdeaId}`);
      }
    }
  }, [isAuthenticated, accounts, user, history, logout, searchParams, setSearchParams, storageAvailable]);

  useEffect(() => {
    if (isAuthenticated && user && !user.is_disabled) {
      // Identify user in Microsoft Clarity
      Clarity.identify(
        user.id.toString(), // required: unique user ID
        undefined, // optional: session ID
        undefined, // optional: page ID
        `${user.email}`, // optional: friendly name
      );

      // Identify user in analytics
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
          {isAuthenticated ? <HermesWebSocketProvider>{children}</HermesWebSocketProvider> : children}
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
        <HermesWebSocketProvider>{children}</HermesWebSocketProvider>
      ) : (
        children
      )}
    </AuthRequirementContext.Provider>
  );
}

export default memo(AuthGuard);

