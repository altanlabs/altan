"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/databases/DatabaseProvider.tsx
const react_1 = __importStar(require("react"));
// Error popup component
const ErrorPopup = ({ message, onClose, config }) => {
    const [copied, setCopied] = (0, react_1.useState)(false);
    // Helper function to find invalid table IDs by comparing with the error message
    const getInvalidTableInfo = () => {
        var _a;
        if (message.includes('Invalid tables:')) {
            return {
                ids: message.split('(')[0].replace('Invalid tables:', '').trim(),
                names: ((_a = message.split('table names:')[1]) === null || _a === void 0 ? void 0 : _a.replace(')', '').trim()) || ''
            };
        }
        // For the generic error message, find invalid tables by checking all table IDs
        const allTableEntries = Object.entries(config.SAMPLE_TABLES);
        const invalidEntries = allTableEntries.filter(([_, id]) => id.length > 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
        if (invalidEntries.length > 0) {
            return {
                ids: invalidEntries.map(([_, id]) => id).join(', '),
                names: invalidEntries.map(([name]) => name).join(', ')
            };
        }
        return null;
    };
    const invalidInfo = getInvalidTableInfo();
    // Format error as a prompt for AI assistance with detailed information
    const formattedError = `Database Configuration Error

Error Message: ${invalidInfo ? `Invalid tables: ${invalidInfo.ids} (table names: ${invalidInfo.names})` : message}

Configuration Details:
${invalidInfo ? `- Invalid Table IDs: ${invalidInfo.ids}` : ''}
- Table Names in Configuration: ${Object.keys(config.SAMPLE_TABLES).join(', ')}
- Table IDs in Configuration: ${Object.values(config.SAMPLE_TABLES).join(', ')}

Please help me fix this database configuration issue in my Altan project. I need to correct the invalid table IDs in my configuration.

Additional Context:
- This error occurred while validating table IDs in the Altan database configuration
- The tables need to exist in the system before they can be used`;
    const copyToClipboard = () => {
        navigator.clipboard.writeText(formattedError).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    // Get a user-friendly message without IDs
    const getUserMessage = () => {
        if (invalidInfo) {
            return `Configuration error: ${invalidInfo.names} could not be found`;
        }
        return message;
    };
    return (react_1.default.createElement("div", { style: {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '15px',
            borderRadius: '5px',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            maxWidth: '500px',
            width: '90%'
        } },
        react_1.default.createElement("div", { style: {
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                paddingBottom: '5px'
            } }, "Database Configuration Error"),
        react_1.default.createElement("div", { style: { marginBottom: '15px' } }, getUserMessage()),
        react_1.default.createElement("div", { style: {
                backgroundColor: 'rgba(0,0,0,0.1)',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '15px'
            } },
            react_1.default.createElement("strong", null, "Need help?"),
            " Click the \"Copy Error\" button below and paste it to the AI assistant in chat for troubleshooting assistance."),
        react_1.default.createElement("div", { style: { display: 'flex', justifyContent: 'space-between' } },
            react_1.default.createElement("button", { onClick: copyToClipboard, style: {
                    backgroundColor: copied ? '#4CAF50' : 'white',
                    color: copied ? 'white' : '#f44336',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                } }, copied ? 'Copied!' : 'Copy Error'),
            react_1.default.createElement("button", { onClick: onClose, style: {
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid white',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                } }, "Close"))));
};
exports.default = ErrorPopup;
//# sourceMappingURL=ErrorPopup.js.map