import { __awaiter, __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useCallback, useEffect, useState, useMemo, } from "react";
import { createAuthenticatedApi } from './api';
import { REFRESH_TOKEN_INTERVAL } from "./constants";
const AuthContext = createContext(null);
// Add refresh token interval constant
export function AuthProvider({ children, tableId, storageKey = "auth_user", onAuthStateChange, authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
}, }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Create the API instance first
    const api = useMemo(() => createAuthenticatedApi(tableId, storageKey), [tableId, storageKey]);
    // Define logout first since other functions depend on it
    const logout = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield api.post('/auth/logout');
        }
        finally {
            if (authenticationOptions.persistSession) {
                localStorage.removeItem(storageKey);
                localStorage.removeItem(`${storageKey}_token`);
            }
            setUser(null);
        }
    }), [api, storageKey, authenticationOptions.persistSession]);
    // Now we can use logout in refreshToken
    const refreshToken = useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = localStorage.getItem(`${storageKey}_token`);
            if (!token)
                return;
            const { data: { access_token } } = yield api.post('/auth/refresh');
            if (authenticationOptions.persistSession) {
                localStorage.setItem(`${storageKey}_token`, access_token);
            }
        }
        catch (error) {
            console.error('Token refresh failed:', error);
            yield logout();
        }
    }), [api, storageKey, authenticationOptions.persistSession, logout]);
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
        var _b, _c;
        try {
            setIsLoading(true);
            setError(null);
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const { data: { access_token } } = yield api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            // Store token immediately after login
            if (authenticationOptions.persistSession && access_token) {
                localStorage.setItem(`${storageKey}_token`, access_token);
            }
            // Now get user data with the new token
            const { data: userData } = yield api.get('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            const authUser = Object.assign({ id: userData.id, email: userData.email, emailVerified: Boolean(userData.email_verified), displayName: userData.display_name, photo: userData.photo || [], photoUrl: (_c = (_b = userData.photo) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.url }, userData);
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
    }), [api, storageKey, authenticationOptions.persistSession]);
    const register = useCallback((_a) => __awaiter(this, void 0, void 0, function* () {
        var { email, password, displayName } = _a, additionalFields = __rest(_a, ["email", "password", "displayName"]);
        try {
            setIsLoading(true);
            setError(null);
            yield api.post("/auth/register", Object.assign(Object.assign({}, additionalFields), { email,
                password, display_name: displayName }));
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
    }), [api, login]);
    // Update checkAuth to use token
    useEffect(() => {
        const checkAuth = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const token = localStorage.getItem(`${storageKey}_token`);
                if (!token) {
                    setUser(null);
                    return;
                }
                const { data: userData } = yield api.get('/auth/me');
                const authUser = Object.assign({ id: userData.id, email: userData.email, emailVerified: Boolean(userData.email_verified), displayName: userData.display_name, photo: userData.photo || [], photoUrl: (_b = (_a = userData.photo) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url }, userData);
                setUser(authUser);
                if (authenticationOptions.persistSession) {
                    localStorage.setItem(storageKey, JSON.stringify(authUser));
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
    }, [api, storageKey, authenticationOptions.persistSession]);
    const resetPassword = useCallback((email) => __awaiter(this, void 0, void 0, function* () {
        // Implement password reset logic here
        throw new Error("Not implemented");
    }), []);
    const updateProfile = useCallback((updates) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!user) {
            throw new Error("No user logged in");
        }
        try {
            setIsLoading(true);
            setError(null);
            // Transform only default fields to snake_case
            const apiUpdates = Object.assign(Object.assign({}, updates), { display_name: updates.displayName, photo: updates.photo });
            const response = yield api.patch('/auth/update', apiUpdates);
            const updatedUser = response.data;
            const authUser = Object.assign(Object.assign({}, updatedUser), { emailVerified: Boolean(updatedUser.email_verified), displayName: updatedUser.display_name, photo: updatedUser.photo || [], photoUrl: (_b = (_a = updatedUser.photo) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url });
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
    }), [user, api, storageKey, authenticationOptions.persistSession]);
    const value = useMemo(() => ({
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        api, // Expose the api instance
    }), [user, isLoading, error, login, logout, register, resetPassword, updateProfile, api]);
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