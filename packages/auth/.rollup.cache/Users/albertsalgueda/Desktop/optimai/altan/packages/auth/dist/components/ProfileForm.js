import { __awaiter } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useAuth } from "../AuthProvider";
export const ProfileForm = ({ className = "", user, isLoading, error, }) => {
    const { updateProfile } = useAuth();
    const [displayName, setDisplayName] = useState(user.displayName || "");
    const fileInputRef = useRef(null);
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        try {
            yield updateProfile({ displayName });
        }
        catch (err) {
            // Error handling is managed by AuthContext
        }
    });
    const handlePhotoChange = (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        try {
            const base64Content = yield new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            yield updateProfile({
                photo: [
                    {
                        file_name: file.name,
                        mime_type: file.type,
                        file_content: base64Content.split(",")[1],
                    },
                ],
            });
        }
        catch (err) {
            // Error handling is managed by AuthContext
        }
    });
    return (_jsxs("form", { onSubmit: handleSubmit, className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex items-center space-x-6", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: user.photoUrl || "default-avatar.png", alt: user.displayName || "Profile", className: "h-20 w-20 rounded-full object-cover ring-2 ring-white shadow" }), _jsx("button", { type: "button", onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white shadow-sm hover:bg-primary-700 transition-colors", children: _jsx("svg", { className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handlePhotoChange, className: "hidden" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Display Name" }), _jsx("input", { type: "text", value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" })] })] }), error && _jsx("div", { className: "text-red-600 text-sm bg-red-50 p-3 rounded-md", children: error.message }), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: isLoading ? "Saving changes..." : "Save changes" })] }));
};
//# sourceMappingURL=ProfileForm.js.map