import { __awaiter } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../AuthProvider';
export default function Logout({ appearance = { theme: 'light' }, onLogout, className = '', }) {
    const { logout } = useAuth();
    const theme = {
        light: {
            button: 'text-red-600 hover:text-red-800',
        },
        dark: {
            button: 'text-red-400 hover:text-red-200',
        }
    }[appearance.theme || 'light'];
    const handleLogout = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield logout();
            onLogout === null || onLogout === void 0 ? void 0 : onLogout();
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    });
    return (_jsxs("button", { onClick: handleLogout, className: `flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 ${theme.button} ${className}`, children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }), _jsx("span", { children: "Logout" })] }));
}
//# sourceMappingURL=Logout.js.map