import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthContextValue,
} from "./types";

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

const AUTH_BASE_URL = 'https://api.altan.ai/tables';

// Add refresh token interval constant
const REFRESH_TOKEN_INTERVAL = 25 * 60 * 1000; // 25 minutes (before 30 min expiry)


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

  // Define logout first since other functions depend on it
  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      if (authenticationOptions.persistSession) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_token`);
      }
      setUser(null);
    }
  }, [tableId, storageKey, authenticationOptions.persistSession]);

  // Now we can use logout in refreshToken
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem(`${storageKey}_token`);
      if (!token) return;

      const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { access_token } = await response.json();
        if (authenticationOptions.persistSession) {
          localStorage.setItem(`${storageKey}_token`, access_token);
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [tableId, storageKey, authenticationOptions.persistSession, logout]);

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
  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const loginResponse = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!loginResponse.ok) {
          throw new Error('Invalid credentials');
        }

        const { access_token, token_type } = await loginResponse.json();

        // Get user info with token
        const userResponse = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
          credentials: 'include',
          headers: {
            'Authorization': `${token_type} ${access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userData = await userResponse.json();
        
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          emailVerified: Boolean(userData.email_verified),
          displayName: userData.display_name,
          photoUrl: userData.photo_url,
          ...userData, // Spread all additional fields from the response
        };

        if (authenticationOptions.persistSession) {
          localStorage.setItem(storageKey, JSON.stringify(authUser));
          localStorage.setItem(`${storageKey}_token`, access_token);
        }

        setUser(authUser);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Login failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tableId, storageKey, authenticationOptions.persistSession]
  );

  const register = useCallback(
    async ({ email, password, displayName, ...additionalFields }: RegisterCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            display_name: displayName,
            ...additionalFields, // Include any additional registration fields
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Registration failed');
        }

        // Login after successful registration
        await login({ email, password });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Registration failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tableId, login]
  );

  // Update checkAuth to use token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(`${storageKey}_token`);
        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const authUser: AuthUser = {
            id: userData.id,
            email: userData.email,
            emailVerified: Boolean(userData.emailverified),
            displayName: userData.displayname,
            photoUrl: userData.photourl,
            ...userData, // Spread all additional fields from the response
          };
          setUser(authUser);
          if (authenticationOptions.persistSession) {
            localStorage.setItem(storageKey, JSON.stringify(authUser));
          }
        } else {
          setUser(null);
          localStorage.removeItem(storageKey);
          localStorage.removeItem(`${storageKey}_token`);
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
  }, [tableId, storageKey, authenticationOptions.persistSession]);

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

        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/update`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            display_name: updates.displayName,
            photo_url: updates.photoUrl,
            email: updates.email,
            ...updates, // Include any additional fields in the update
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Profile update failed');
        }

        const updatedUser = await response.json();

        // Convert snake_case to camelCase for frontend
        const authUser: AuthUser = {
          id: updatedUser.id,
          email: updatedUser.email,
          emailVerified: Boolean(updatedUser.emailverified),
          displayName: updatedUser.displayname,
          photoUrl: updatedUser.photourl,
          ...updatedUser, // Spread all additional fields from the response
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
    [user, tableId, storageKey, authenticationOptions.persistSession]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
