import { ReactNode } from "react";
export interface AuthUser {
    id: string;
    email: string;
    email_verified: boolean;
    display_name?: string;
    photo_url?: string;
}
interface LoginCredentials {
    email: string;
    password: string;
}
interface RegisterCredentials extends LoginCredentials {
    display_name?: string;
}
interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    error: Error | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
    isAuthenticated: boolean;
}
interface AuthProviderProps {
    children: ReactNode;
    storageKey?: string;
    onAuthStateChange?: (user: AuthUser | null) => void;
    authenticationOptions?: {
        persistSession?: boolean;
        redirectUrl?: string;
    };
}
export declare function AuthProvider({ children, storageKey, onAuthStateChange, authenticationOptions, }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
//# sourceMappingURL=AuthContext.d.ts.map