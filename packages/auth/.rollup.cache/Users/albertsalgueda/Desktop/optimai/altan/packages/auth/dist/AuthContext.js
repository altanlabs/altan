import { __awaiter } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useCallback, useEffect, useState, } from "react";
import { useDatabase } from "@altanlabs/database";
import { hashPassword, comparePasswords } from "./crypto";
const AuthContext = createContext(null);
const defaultMapping = {
    email: 'email',
    password: 'password',
    emailVerified: 'email_verified',
    displayName: 'display_name',
    photoUrl: 'photo_url'
};
export function AuthProvider({ children, storageKey = "auth_user", onAuthStateChange, authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
}, fieldMapping = {}, }) {
    const mapping = Object.assign(Object.assign({}, defaultMapping), fieldMapping);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Use the database hook to interact with the users table
    const { records: users, addRecord, modifyRecord, refresh, } = useDatabase("users", {
        limit: 1, // We typically only need to fetch one user at a time
    });
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
        onAuthStateChange === null || onAuthStateChange === void 0 ? void 0 : onAuthStateChange(user);
    }, [user, onAuthStateChange]);
    const login = useCallback((_a) => __awaiter(this, [_a], void 0, function* ({ email, password }) {
        try {
            setIsLoading(true);
            setError(null);
            // Find user by email
            yield refresh({
                filters: [{ field: mapping.email, operator: "eq", value: email }],
                limit: 1,
            });
            const foundUser = users[0];
            if (!foundUser) {
                throw new Error("User not found");
            }
            // Verify password
            const isValid = yield comparePasswords(password, foundUser.fields[mapping.password]);
            if (!isValid) {
                throw new Error("Invalid credentials");
            }
            // Create user object without sensitive data
            const authUser = {
                id: foundUser.id,
                email: foundUser.fields[mapping.email],
                emailVerified: Boolean(foundUser.fields[mapping.emailVerified]),
                displayName: foundUser.fields[mapping.displayName],
                photoUrl: foundUser.fields[mapping.photoUrl],
            };
            // Store user if persistence is enabled
            if (authenticationOptions.persistSession) {
                localStorage.setItem(storageKey, JSON.stringify(authUser));
            }
            setUser(authUser);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Login failed"));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [users, refresh, storageKey, authenticationOptions.persistSession]);
    const register = useCallback((_a) => __awaiter(this, [_a], void 0, function* ({ email, password, display_name }) {
        try {
            setIsLoading(true);
            setError(null);
            // Check if user already exists
            yield refresh({
                filters: [{ field: mapping.email, operator: "eq", value: email }],
                limit: 1,
            });
            if (users.length > 0) {
                throw new Error("User already exists");
            }
            // Hash password
            const hashedPassword = yield hashPassword(password);
            // Create new user
            const newUser = yield addRecord({
                [mapping.email]: email,
                [mapping.password]: hashedPassword,
                [mapping.displayName]: display_name,
                [mapping.emailVerified]: false,
            });
            // Log in the new user
            yield login({ email, password });
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Registration failed"));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [users, refresh, addRecord, login, mapping]);
    const logout = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        if (authenticationOptions.persistSession) {
            localStorage.removeItem(storageKey);
        }
        setUser(null);
    }), [storageKey, authenticationOptions.persistSession]);
    const resetPassword = useCallback((email) => __awaiter(this, void 0, void 0, function* () {
        // Implement password reset logic here
        throw new Error("Not implemented");
    }), []);
    const updateProfile = useCallback((updates) => __awaiter(this, void 0, void 0, function* () {
        if (!user) {
            throw new Error("No user logged in");
        }
        try {
            setIsLoading(true);
            setError(null);
            yield modifyRecord(user.id, updates);
            // Update local user state
            setUser((prev) => (prev ? Object.assign(Object.assign({}, prev), updates) : null));
            // Update stored user if persistence is enabled
            if (authenticationOptions.persistSession) {
                const storedUser = localStorage.getItem(storageKey);
                if (storedUser) {
                    localStorage.setItem(storageKey, JSON.stringify(Object.assign(Object.assign({}, JSON.parse(storedUser)), updates)));
                }
            }
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Profile update failed"));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [user, modifyRecord, storageKey, authenticationOptions.persistSession]);
    const value = {
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
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
//# sourceMappingURL=AuthContext.js.map