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

  const mapUserData = (userData: any): AuthUser => ({
    id: String(userData.id || ""),
    email: userData.email || "",
    name: userData.name,
    surname: userData.surname,
    avatar: Array.isArray(userData.avatar) ? userData.avatar : [],
    verified: Boolean(userData.verified),
    ...Object.fromEntries(
      Object.entries(userData).filter(([key]) => 
        !["id", "email", "name", "surname", "avatar", "verified"].includes(key)
      )
    )
  });

  // Define logout first since other functions depend on it
  const logout = useCallback(async () => {
    try {
      await api.post(`/auth/logout?table_id=${tableId}`);
    } finally {
      if (authenticationOptions.persistSession) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_token`);
      }
      setUser(null);
    }
  }, [api, storageKey, authenticationOptions.persistSession, tableId]);

  // Now we can use logout in refreshToken
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem(`${storageKey}_token`);
      if (!token) return;

      const { data: { access_token } } = await api.post(`/auth/refresh?table_id=${tableId}`);
      if (authenticationOptions.persistSession) {
        localStorage.setItem(`${storageKey}_token`, access_token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [api, storageKey, authenticationOptions.persistSession, logout, tableId]);

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

      const { data: { access_token } } = await api.post(`/auth/login?table_id=${tableId}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (authenticationOptions.persistSession && access_token) {
        localStorage.setItem(`${storageKey}_token`, access_token);
      }

      // Add tableId to /me request
      const { data: userData } = await api.get(`/auth/me?table_id=${tableId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      const authUser = mapUserData(userData);

      if (authenticationOptions.persistSession) {
        localStorage.setItem(storageKey, JSON.stringify(authUser));
      }

      setUser(authUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Invalid email or password";
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, storageKey, authenticationOptions.persistSession, tableId]);

  const register = useCallback(async ({ email, password, name, surname, ...additionalFields }: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(`/auth/register?table_id=${tableId}`, {
        email,
        password,
        name,
        surname,
        ...additionalFields,
      });

      if (response.status === 200) {
        await login({ email, password });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Registration failed";
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, login, tableId]);

  // Update checkAuth to use token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(`${storageKey}_token`);
        if (!token) {
          setUser(null);
          return;
        }

        const { data: userData } = await api.get(`/auth/me?table_id=${tableId}`);
        const authUser = mapUserData(userData);
        
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
  }, [api, storageKey, authenticationOptions.persistSession, tableId]);

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

        const apiUpdates: Record<string, any> = { ...updates };

        // Special handling for avatar field
        if ('avatar' in updates) {
          if (updates.avatar === null) {
            // If explicitly set to null, remove the avatar
            apiUpdates.avatar = [];
          } else if (typeof updates.avatar === 'string') {
            // If it's a base64 string (from file upload), create new media object
            apiUpdates.avatar = [{
              file_name: 'avatar.jpg',
              mime_type: 'image/jpeg',
              file_content: updates.avatar
            }];
          } else {
            // If it's already an array of media objects, use as is
            apiUpdates.avatar = updates.avatar;
          }
        }

        const response = await api.patch(`/auth/update?table_id=${tableId}`, apiUpdates);
        const updatedUser = mapUserData(response.data.user);

        setUser(updatedUser);

        if (authenticationOptions.persistSession) {
          localStorage.setItem(storageKey, JSON.stringify(updatedUser));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Profile update failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, api, storageKey, authenticationOptions.persistSession, tableId]
  );

  const continueWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Open popup window and handle authentication
      const authWindow = window.open(
        `${api.defaults.baseURL}/auth/google/?table_id=${tableId}&redirect_url=${encodeURIComponent(window.location.origin)}`,
        'Google Auth',
        'width=600,height=600'
      );

      const userData = await new Promise((resolve, reject) => {
        window.addEventListener('message', function handleAuth(event) {
          // Cleanup
          if (authWindow) {
            authWindow.close();
          }
          window.removeEventListener('message', handleAuth);

          const response = event.data;
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });

      // Handle successful authentication
      const { access_token, user: googleUser } = userData as any;
      
      if (authenticationOptions.persistSession && access_token) {
        localStorage.setItem(`${storageKey}_token`, access_token);
      }

      const authUser = mapUserData(googleUser);

      if (authenticationOptions.persistSession) {
        localStorage.setItem(storageKey, JSON.stringify(authUser));
      }

      setUser(authUser);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Google authentication failed"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, storageKey, authenticationOptions.persistSession, tableId]);

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
      continueWithGoogle,
      api,
    }),
    [user, isLoading, error, login, logout, register, resetPassword, updateProfile, continueWithGoogle, api]
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
