import { ReactNode } from "react";
import { FieldMapping } from "./types";
export interface AuthUser {
    id: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoUrl?: string;
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
    tableId: string;
    storageKey?: string;
    onAuthStateChange?: (user: AuthUser | null) => void;
    authenticationOptions?: {
        persistSession?: boolean;
        redirectUrl?: string;
    };
    fieldMapping?: FieldMapping;
}
export declare function AuthProvider({ children, storageKey, onAuthStateChange, authenticationOptions, fieldMapping, tableId, }: AuthProviderProps & {
    tableId: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
//# sourceMappingURL=AuthContext.d.ts.map