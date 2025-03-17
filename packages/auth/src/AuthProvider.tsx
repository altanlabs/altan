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
import { createAuthenticatedApi, authAxios, setSession } from './api';
import { AxiosInstance } from "axios";


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
  storageKey = "",
  onAuthStateChange,
  authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
  },
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mustAuth, setMustAuth] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const api = useMemo(() => createAuthenticatedApi(), [tableId]);

  const mapUserData = (userData: any): AuthUser => ({
    id: Number(userData.id || 0),
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
      await authAxios.post('/auth/logout');
    } finally {
      setSession(api, null);
      setUser(null);
    }
  }, [api, authenticationOptions.persistSession, tableId]);

  // Notify on auth state changes
  useEffect(() => {
    onAuthStateChange?.(user);
  }, [user, onAuthStateChange]);

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

      // Add tableId to /me request
      setSession(api, access_token)
      setMustAuth(prev => prev + 1);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Invalid email or password";
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, authenticationOptions.persistSession, tableId]);

  const register = useCallback(async ({ email, password, name, surname, ...additionalFields }: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authAxios.post(`/auth/register?table_id=${tableId}`, {
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

        const response = await api.patch('/auth/update', apiUpdates);
        const updatedUser = mapUserData(response.data.user);
        setUser(updatedUser);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Profile update failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, api, authenticationOptions.persistSession, tableId]
  );

  const continueWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authWindow = window.open(
        `https://api.altan.ai/tables/auth/google/authorize?table_id=${tableId}&redirect_url=${encodeURIComponent(
          window.location.origin
        )}`,
        "Auth",
        "width=600,height=600,scrollbars=yes"
      );

      const userData = await new Promise((resolve, reject) => {
        let authTimeout: NodeJS.Timeout;

        function handleAuth(event: MessageEvent) {
          // Verify origin
          if (event.origin !== "https://api.altan.ai") return;

          // Clear timeout first
          if (authTimeout) clearTimeout(authTimeout);

          // Remove listener
          window.removeEventListener("message", handleAuth);

          const response = event.data;
          if (response.error) {
            reject(new Error(response.error));
          } else if (response.success) {
            resolve(response);
          } else {
            reject(new Error("Invalid response format"));
          }
        }

        window.addEventListener("message", handleAuth);

        authTimeout = setTimeout(() => {
          window.removeEventListener("message", handleAuth);
          reject(new Error("Authentication timed out"));
        }, 120000);
      });

      // Handle successful authentication
      const { access_token, user: googleUser } = userData as any;

      if (authenticationOptions.persistSession && access_token) {
        setSession(api, access_token)
      }
      setMustAuth(prev => prev + 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, tableId, authenticationOptions.persistSession]);

  // Update checkAuth to use token
  useEffect(() => {
    const checkAuth = async () => {
      if (!tableId || isLoading) {
        return;
      }
      setIsLoading(true);
      try {
        const { data: userData } = await api.get('/auth/me');
        const authUser = mapUserData(userData);        
        setUser(authUser);
      } catch (error) {
        console.debug("@checkAuth: error", error);
        setUser(null);
      } finally {
        setInitialized(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [api, mustAuth]);

  const value = useMemo(
    () => ({
      user,
      isLoading: isLoading || !initialized,
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
    [
      user, 
      initialized,
      isLoading, 
      error, 
      login, 
      logout, 
      register, 
      resetPassword, 
      updateProfile, 
      continueWithGoogle, 
      api
    ]
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


// Granular hook for user data and authentication status
export function useAuthUser() {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
}

// Granular hook for loading state
export function useAuthLoading() {
  const { isLoading } = useAuth();
  return isLoading;
}

// Granular hook for error state
export function useAuthError() {
  const { error } = useAuth();
  return error;
}

// Granular hook for authentication actions
export function useAuthActions() {
  const { login, logout, register, resetPassword, updateProfile, continueWithGoogle } = useAuth();
  return { login, logout, register, resetPassword, updateProfile, continueWithGoogle };
}

// Granular hook for API access
export function useAuthAPI(raiseError: boolean = true): AxiosInstance | null {
  const context = useContext(AuthContext);

  if (!context) {
    if (raiseError) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return null;
  }

  return context.api;
}