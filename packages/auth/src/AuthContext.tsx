import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthContextValue,
} from "./types";
import { createAuthenticatedApi } from './api';
import { REFRESH_TOKEN_INTERVAL } from "./constants";


const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  tableId: string;
  storageKey?: string;
  onAuthStateChange?: (user: AuthUser | null) => void;
  authenticationOptions?: {
    persistSession?: boolean;
    redirectUrl?: string;
  };
}


// Add refresh token interval constant
export function AuthProvider({
  children,
  tableId,
  storageKey = "auth_user",
  onAuthStateChange,
  authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
  },
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create the API instance first
  const api = useMemo(() => createAuthenticatedApi(tableId, storageKey), [tableId, storageKey]);

  // Define logout first since other functions depend on it
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      if (authenticationOptions.persistSession) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_token`);
      }
      setUser(null);
    }
  }, [api, storageKey, authenticationOptions.persistSession]);

  // Now we can use logout in refreshToken
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem(`${storageKey}_token`);
      if (!token) return;

      const { data: { access_token } } = await api.post('/auth/refresh');
      if (authenticationOptions.persistSession) {
        localStorage.setItem(`${storageKey}_token`, access_token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [api, storageKey, authenticationOptions.persistSession, logout]);

  // Initialize auth state from storage
  useEffect(() => {
    if (authenticationOptions.persistSession) {
      const storedUser = localStorage.getItem(storageKey);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, [storageKey, authenticationOptions.persistSession]);

  // Notify on auth state changes
  useEffect(() => {
    onAuthStateChange?.(user);
  }, [user, onAuthStateChange]);

  // Add refresh token interval
  useEffect(() => {
    if (!user) return;

    // Initial refresh after 25 minutes
    const refreshInterval = setInterval(refreshToken, REFRESH_TOKEN_INTERVAL);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, refreshToken]);

  // Update login to start refresh cycle
  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const { data: { access_token } } = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Store token immediately after login
      if (authenticationOptions.persistSession && access_token) {
        localStorage.setItem(`${storageKey}_token`, access_token);
      }

      // Now get user data with the new token
      const { data: userData } = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        emailVerified: Boolean(userData.email_verified),
        displayName: userData.display_name,
        photo: userData.photo || [],
        photoUrl: userData.photo?.[0]?.url,
        ...userData,
      };

      if (authenticationOptions.persistSession) {
        localStorage.setItem(storageKey, JSON.stringify(authUser));
      }

      setUser(authUser);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, storageKey, authenticationOptions.persistSession]);

  const register = useCallback(async ({ email, password, displayName, ...additionalFields }: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      await api.post("/auth/register", {
        ...additionalFields,
        email,
        password,
        display_name: displayName,
      });

      // Login after successful registration
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Registration failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, login]);

  // Update checkAuth to use token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(`${storageKey}_token`);
        if (!token) {
          setUser(null);
          return;
        }

        const { data: userData } = await api.get('/auth/me');
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          emailVerified: Boolean(userData.email_verified),
          displayName: userData.display_name,
          photo: userData.photo || [],
          photoUrl: userData.photo?.[0]?.url,
          ...userData,
        };
        
        setUser(authUser);
        if (authenticationOptions.persistSession) {
          localStorage.setItem(storageKey, JSON.stringify(authUser));
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_token`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [api, storageKey, authenticationOptions.persistSession]);

  const resetPassword = useCallback(async (email: string) => {
    // Implement password reset logic here
    throw new Error("Not implemented");
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      if (!user) {
        throw new Error("No user logged in");
      }

      try {
        setIsLoading(true);
        setError(null);

        // Transform only default fields to snake_case
        const apiUpdates = {
          ...updates,
          display_name: updates.displayName,
          photo: updates.photo,
        };

        const response = await api.patch('/auth/update', apiUpdates);

        const updatedUser = response.data;
        const authUser: AuthUser = {
          ...updatedUser,
          emailVerified: Boolean(updatedUser.email_verified),
          displayName: updatedUser.display_name,
          photo: updatedUser.photo || [],
          photoUrl: updatedUser.photo?.[0]?.url,
        };

        setUser(authUser);

        if (authenticationOptions.persistSession) {
          localStorage.setItem(storageKey, JSON.stringify(authUser));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Profile update failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, api, storageKey, authenticationOptions.persistSession]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      resetPassword,
      updateProfile,
      api, // Expose the api instance
    }),
    [user, isLoading, error, login, logout, register, resetPassword, updateProfile, api]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
