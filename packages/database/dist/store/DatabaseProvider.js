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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseProvider = void 0;
// src/databases/DatabaseProvider.tsx
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const toolkit_1 = require("@reduxjs/toolkit");
const tablesSlice_1 = __importDefault(require("./tablesSlice"));
const config_1 = require("../config");
const tablesSlice_2 = require("./tablesSlice");
const axios_1 = require("../api/axios");
const axios_2 = __importDefault(require("axios"));
const ErrorPopup_1 = __importDefault(require("../components/ErrorPopup"));
// Create a singleton axios instance for table validation
const validationAxios = axios_2.default.create();
// Global cache for validated tables
const globalValidatedTables = {};
// Global request tracking
const requestInProgress = {};
// Validate tables with global cache
const validateTablesGlobally = async (tableIds) => {
    try {
        // Filter out already validated tables
        const tablesToValidate = tableIds.filter(id => !globalValidatedTables[id]);
        if (tablesToValidate.length === 0) {
            return { valid: true };
        }
        // Join table IDs with commas
        const tableIdsParam = tablesToValidate.join(',');
        const pingUrl = `https://api.altan.ai/tables/table/ping?table_ids=${tableIdsParam}`;
        const requestKey = `ping_${tableIdsParam}`;
        // Check if request is already in progress
        if (requestInProgress[requestKey]) {
            // Wait for the request to complete by polling
            return new Promise((resolve) => {
                const checkComplete = () => {
                    if (!requestInProgress[requestKey]) {
                        // Check if all tables are now validated
                        const allValid = tablesToValidate.every(id => globalValidatedTables[id]);
                        resolve({ valid: allValid });
                    }
                    else {
                        setTimeout(checkComplete, 50);
                    }
                };
                checkComplete();
            });
        }
        // Mark request as in progress
        requestInProgress[requestKey] = true;
        try {
            const response = await validationAxios.get(pingUrl);
            if (!response.data.all_valid) {
                const invalidTables = response.data.invalid_tables || [];
                // Mark valid tables as validated globally
                const validTables = response.data.valid_tables || [];
                validTables.forEach((id) => {
                    globalValidatedTables[id] = true;
                });
                return { valid: false, invalidTables };
            }
            // Mark these tables as validated globally
            tablesToValidate.forEach(id => {
                globalValidatedTables[id] = true;
            });
            return { valid: true };
        }
        finally {
            // Mark request as complete
            requestInProgress[requestKey] = false;
        }
    }
    catch (err) {
        console.error(`Table validation error:`, err);
        return { valid: false };
    }
};
const DatabaseProvider = (0, react_1.memo)(({ config, children, customMiddleware = [], }) => {
    const [error, setError] = (0, react_1.useState)(null);
    const [isValidating, setIsValidating] = (0, react_1.useState)(true);
    const configRef = (0, react_1.useRef)(config);
    const [validationComplete, setValidationComplete] = (0, react_1.useState)(false);
    // Memoize the base URL validation result
    const isBaseUrlValid = (0, react_1.useMemo)(() => {
        const baseUrlPattern = /^https:\/\/api\.altan\.ai\/galaxia\/hook\/.+/;
        return baseUrlPattern.test(config.API_BASE_URL);
    }, [config.API_BASE_URL]);
    // Validate configuration on mount
    (0, react_1.useEffect)(() => {
        // Skip validation if config hasn't changed and validation is already complete
        if (configRef.current === config && validationComplete) {
            return;
        }
        configRef.current = config;
        const validateConfig = async () => {
            var _a;
            setIsValidating(true);
            try {
                if (!isBaseUrlValid) {
                    setError(`Invalid base URL format. URL must start with https://api.altan.ai/galaxia/hook/`);
                    setIsValidating(false);
                    return;
                }
                if (config.SAMPLE_TABLES) {
                    const tableIds = Object.values(config.SAMPLE_TABLES);
                    const validationResult = await validateTablesGlobally(tableIds);
                    if (!validationResult.valid) {
                        let errorMessage;
                        if ((_a = validationResult.invalidTables) === null || _a === void 0 ? void 0 : _a.length) {
                            // Find the table names that correspond to the invalid IDs
                            const invalidTableNames = Object.entries(config.SAMPLE_TABLES)
                                .filter(([_, id]) => { var _a; return (_a = validationResult.invalidTables) === null || _a === void 0 ? void 0 : _a.includes(id); })
                                .map(([name]) => name)
                                .join(', ');
                            const invalidTableIds = validationResult.invalidTables.join(', ');
                            errorMessage = `Invalid tables: ${invalidTableIds} (table names: ${invalidTableNames})`;
                        }
                        else {
                            errorMessage = 'One or more tables could not be found';
                        }
                        setError(errorMessage);
                        setIsValidating(false);
                        return;
                    }
                }
                setIsValidating(false);
                setValidationComplete(true);
            }
            catch (error) {
                console.error("[DatabaseProvider] Validation error:", error);
                setError(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
                setIsValidating(false);
            }
        };
        validateConfig();
    }, [config, isBaseUrlValid]);
    // Create the Redux store once using useMemo, but only after validation is complete
    const store = (0, react_1.useMemo)(() => {
        // Only create store if validation passed
        if (error || isValidating) {
            return null;
        }
        try {
            (0, config_1.validateDatabaseConfig)(config);
            const api = (0, axios_1.createAltanDB)(config.API_BASE_URL);
            const s = (0, toolkit_1.configureStore)({
                reducer: {
                    tables: tablesSlice_1.default,
                },
                middleware: (getDefaultMiddleware) => getDefaultMiddleware({
                    thunk: {
                        // Create the axios instance once using the API_BASE_URL from the provider config.
                        extraArgument: { api },
                    },
                }).concat(customMiddleware),
            });
            // Only initialize tables after validation is complete
            s.dispatch((0, tablesSlice_2.initializeTables)(config));
            return s;
        }
        catch (err) {
            console.error("Store creation error:", err);
            setError(`Configuration error: ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }, [config, customMiddleware, error, isValidating]);
    // Handle closing the error popup
    const handleCloseError = () => {
        setError(null);
    };
    if (isValidating) {
        return null;
    }
    if (error) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ErrorPopup_1.default, { message: error, onClose: handleCloseError, config: config }),
            react_1.default.createElement("div", null, "Unable to initialize database due to configuration errors.")));
    }
    if (!store) {
        return react_1.default.createElement("div", null, "Failed to initialize database store.");
    }
    return react_1.default.createElement(react_redux_1.Provider, { store: store }, children);
});
exports.DatabaseProvider = DatabaseProvider;
DatabaseProvider.displayName = 'DatabaseProvider';
//# sourceMappingURL=DatabaseProvider.js.map