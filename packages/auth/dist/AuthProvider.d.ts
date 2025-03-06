import { ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials, AuthContextValue } from "./types";
import { AxiosInstance } from "axios";
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
export declare function AuthProvider({ children, tableId, storageKey, onAuthStateChange, authenticationOptions, }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextValue;
export declare function useAuthUser(): {
    user: AuthUser | null;
    isAuthenticated: boolean;
};
export declare function useAuthLoading(): boolean;
export declare function useAuthError(): Error | null;
export declare function useAuthActions(): {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
    continueWithGoogle: () => Promise<void>;
};
export declare function useAuthAPI(raiseError?: boolean): AxiosInstance | null;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map