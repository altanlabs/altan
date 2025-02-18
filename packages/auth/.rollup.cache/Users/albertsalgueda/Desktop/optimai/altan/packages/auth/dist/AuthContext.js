import { __awaiter, __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useCallback, useEffect, useState, } from "react";
const AuthContext = createContext(null);
const AUTH_BASE_URL = 'https://api.altan.ai/tables';
// Add refresh token interval constant
const REFRESH_TOKEN_INTERVAL = 25 * 60 * 1000; // 25 minutes (before 30 min expiry)
export function AuthProvider({ children, tableId, storageKey = "auth_user", onAuthStateChange, authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
}, }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Define logout first since other functions depend on it
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
                localStorage.removeItem(`${storageKey}_token`);
            }
            setUser(null);
        }
    }), [tableId, storageKey, authenticationOptions.persistSession]);
    // Now we can use logout in refreshToken
    const refreshToken = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = localStorage.getItem(`${storageKey}_token`);
            if (!token)
                return;
            const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const { access_token } = yield response.json();
                if (authenticationOptions.persistSession) {
                    localStorage.setItem(`${storageKey}_token`, access_token);
                }
            }
            else {
                yield logout();
            }
        }
        catch (error) {
            console.error('Token refresh failed:', error);
            yield logout();
        }
    }), [tableId, storageKey, authenticationOptions.persistSession, logout]);
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
    // Add refresh token interval
    useEffect(() => {
        if (!user)
            return;
        // Initial refresh after 25 minutes
        const refreshInterval = setInterval(refreshToken, REFRESH_TOKEN_INTERVAL);
        return () => {
            clearInterval(refreshInterval);
        };
    }, [user, refreshToken]);
    // Update login to start refresh cycle
    const login = useCallback((_a) => __awaiter(this, [_a], void 0, function* ({ email, password }) {
        try {
            setIsLoading(true);
            setError(null);
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const loginResponse = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/login`, {
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
            const { access_token, token_type } = yield loginResponse.json();
            // Get user info with token
            const userResponse = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
                credentials: 'include',
                headers: {
                    'Authorization': `${token_type} ${access_token}`
                }
            });
            if (!userResponse.ok) {
                throw new Error('Failed to get user info');
            }
            const userData = yield userResponse.json();
            const authUser = Object.assign({ id: userData.id, email: userData.email, emailVerified: Boolean(userData.email_verified), displayName: userData.display_name, photoUrl: userData.photo_url }, userData);
            if (authenticationOptions.persistSession) {
                localStorage.setItem(storageKey, JSON.stringify(authUser));
                localStorage.setItem(`${storageKey}_token`, access_token);
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
    const register = useCallback((_a) => __awaiter(this, void 0, void 0, function* () {
        var { email, password, displayName } = _a, additionalFields = __rest(_a, ["email", "password", "displayName"]);
        try {
            setIsLoading(true);
            setError(null);
            const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign({ email,
                    password, display_name: displayName }, additionalFields)),
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
    // Update checkAuth to use token
    useEffect(() => {
        const checkAuth = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = localStorage.getItem(`${storageKey}_token`);
                if (!token) {
                    setUser(null);
                    return;
                }
                const response = yield fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = yield response.json();
                    const authUser = Object.assign({ id: userData.id, email: userData.email, emailVerified: Boolean(userData.emailverified), displayName: userData.displayname, photoUrl: userData.photourl }, userData);
                    setUser(authUser);
                    if (authenticationOptions.persistSession) {
                        localStorage.setItem(storageKey, JSON.stringify(authUser));
                    }
                }
                else {
                    setUser(null);
                    localStorage.removeItem(storageKey);
                    localStorage.removeItem(`${storageKey}_token`);
                }
            }
            catch (error) {
                setUser(null);
                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}_token`);
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
                body: JSON.stringify(Object.assign({ display_name: updates.displayName, photo_url: updates.photoUrl, email: updates.email }, updates)),
            });
            if (!response.ok) {
                const error = yield response.json();
                throw new Error(error.detail || 'Profile update failed');
            }
            const updatedUser = yield response.json();
            // Convert snake_case to camelCase for frontend
            const authUser = Object.assign({ id: updatedUser.id, email: updatedUser.email, emailVerified: Boolean(updatedUser.emailverified), displayName: updatedUser.displayname, photoUrl: updatedUser.photourl }, updatedUser);
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