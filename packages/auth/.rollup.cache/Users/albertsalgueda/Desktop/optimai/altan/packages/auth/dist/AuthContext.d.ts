import { ReactNode } from "react";
import type { AuthUser, AuthContextValue } from "./types";
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
export {};
//# sourceMappingURL=AuthContext.d.ts.map