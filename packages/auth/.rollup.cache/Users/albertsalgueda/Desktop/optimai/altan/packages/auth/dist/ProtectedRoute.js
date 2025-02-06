import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function ProtectedRoute({ children, redirectTo = "/login", }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return _jsx("div", { children: "Loading..." }); // Or your loading component
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: redirectTo, replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=ProtectedRoute.js.map