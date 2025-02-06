import { __awaiter } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useCallback, useEffect, useState, } from "react";
import { useDatabase } from "@altanlabs/database";
import { hashPassword, comparePasswords } from "./crypto";
const AuthContext = createContext(null);
export function AuthProvider({ children, storageKey = "auth_user", onAuthStateChange, authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
}, }) {
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
                filters: [{ field: "email", operator: "eq", value: email }],
                limit: 1,
            });
            const foundUser = users[0];
            if (!foundUser) {
                throw new Error("User not found");
            }
            // Verify password
            const isValid = yield comparePasswords(password, foundUser.fields.password);
            if (!isValid) {
                throw new Error("Invalid credentials");
            }
            // Create user object without sensitive data
            const authUser = {
                id: foundUser.id,
                email: foundUser.fields.email,
                emailVerified: Boolean(foundUser.fields.emailVerified),
                displayName: foundUser.fields.displayName,
                photoURL: foundUser.fields.photoURL,
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
    const register = useCallback((_a) => __awaiter(this, [_a], void 0, function* ({ email, password, displayName }) {
        try {
            setIsLoading(true);
            setError(null);
            // Check if user already exists
            yield refresh({
                filters: [{ field: "email", operator: "eq", value: email }],
                limit: 1,
            });
            if (users.length > 0) {
                throw new Error("User already exists");
            }
            // Hash password
            const hashedPassword = yield hashPassword(password);
            // Create new user
            const newUser = yield addRecord({
                email,
                password: hashedPassword,
                displayName,
                emailVerified: false,
                createdAt: new Date().toISOString(),
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
    }), [users, refresh, addRecord, login]);
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