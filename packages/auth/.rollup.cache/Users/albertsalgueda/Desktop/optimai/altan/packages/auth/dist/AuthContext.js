import { __awaiter } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useCallback, useEffect, useState, } from "react";
const AuthContext = createContext(null);
const defaultMapping = {
    email: 'email',
    password: 'password',
    emailVerified: 'email_verified',
    displayName: 'display_name',
    photoUrl: 'photo_url'
};
const AUTH_BASE_URL = 'https://api.altan.ai/tables';
export function AuthProvider({ children, storageKey = "auth_user", onAuthStateChange, authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
}, fieldMapping = {}, tableId, }) {
    const mapping = Object.assign(Object.assign({}, defaultMapping), fieldMapping);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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
            // Use the auth endpoint directly
            const formData = new URLSearchParams();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);
            const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/login`, {
                method: 'POST',
                credentials: 'include', // Important for cookies
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            // Get user info
            const userResponse = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
                credentials: 'include',
            });
            if (!userResponse.ok) {
                throw new Error('Failed to get user info');
            }
            const authUser = yield userResponse.json();
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
    }), [tableId, storageKey, authenticationOptions.persistSession]);
    const register = useCallback((_a) => __awaiter(this, [_a], void 0, function* ({ email, password, display_name }) {
        try {
            setIsLoading(true);
            setError(null);
            const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    display_name,
                }),
            });
            if (!response.ok) {
                const error = yield response.json();
                throw new Error(error.detail || 'Registration failed');
            }
            // Login after successful registration
            yield login({ email, password });
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Registration failed"));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [tableId, login]);
    const logout = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        }
        finally {
            if (authenticationOptions.persistSession) {
                localStorage.removeItem(storageKey);
            }
            setUser(null);
        }
    }), [tableId, storageKey, authenticationOptions.persistSession]);
    // Check auth status on mount
    useEffect(() => {
        const checkAuth = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const authUser = yield response.json();
                    setUser(authUser);
                    if (authenticationOptions.persistSession) {
                        localStorage.setItem(storageKey, JSON.stringify(authUser));
                    }
                }
                else {
                    setUser(null);
                    localStorage.removeItem(storageKey);
                }
            }
            catch (error) {
                setUser(null);
                localStorage.removeItem(storageKey);
            }
            finally {
                setIsLoading(false);
            }
        });
        checkAuth();
    }, [tableId, storageKey, authenticationOptions.persistSession]);
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
            const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/update`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    display_name: updates.displayName,
                    photo_url: updates.photoUrl,
                    email: updates.email,
                }),
            });
            if (!response.ok) {
                const error = yield response.json();
                throw new Error(error.detail || 'Profile update failed');
            }
            const updatedUser = yield response.json();
            // Convert snake_case to camelCase for frontend
            const authUser = {
                id: updatedUser.id,
                email: updatedUser.email,
                emailVerified: updatedUser.email_verified,
                displayName: updatedUser.display_name,
                photoUrl: updatedUser.photo_url,
            };
            setUser(authUser);
            if (authenticationOptions.persistSession) {
                localStorage.setItem(storageKey, JSON.stringify(authUser));
            }
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Profile update failed"));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }), [user, tableId, storageKey, authenticationOptions.persistSession]);
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