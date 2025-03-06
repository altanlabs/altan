// src/databases/DatabaseProvider.tsx
import React, { ReactNode, useMemo, useState, useEffect, useRef, memo } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useAuthAPI } from '@altanlabs/auth';
import tablesReducer from "./tablesSlice";
import type { DatabaseConfig } from "../config";
import { validateDatabaseConfig } from "../config";
import { initializeTables } from "./tablesSlice";
import { createAltanDB } from "../api/axios";
import axios from "axios";
import ErrorPopup from "../components/ErrorPopup";
import { Middleware } from "redux";

interface DatabaseProviderProps {
  config: DatabaseConfig;
  children: ReactNode;
  enableDevTools?: boolean; // Add option to disable Redux DevTools
  customMiddleware?: Array<any>; // Allow custom middleware
}

// Create a singleton axios instance for table validation
const validationAxios = axios.create();

// Global cache for validated tables
const globalValidatedTables: Record<string, boolean> = {};

// Global request tracking
const requestInProgress: Record<string, boolean> = {};

// Validate tables with global cache
const validateTablesGlobally = async (tableIds: string[]): Promise<{ valid: boolean; invalidTables?: string[] }> => {
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
          } else {
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
        validTables.forEach((id: string) => {
          globalValidatedTables[id] = true;
        });
        
        return { valid: false, invalidTables };
      }
      
      // Mark these tables as validated globally
      tablesToValidate.forEach(id => {
        globalValidatedTables[id] = true;
      });
      
      return { valid: true };
    } finally {
      // Mark request as complete
      requestInProgress[requestKey] = false;
    }
  } catch (err) {
    console.error(`Table validation error:`, err);
    return { valid: false };
  }
};

const DatabaseProviderComponent: React.FC<DatabaseProviderProps> = ({
  config,
  children,
  customMiddleware = [],
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const configRef = useRef(config);
  const [validationComplete, setValidationComplete] = useState(false);
  const authenticatedAPI = useAuthAPI(false);

  // Memoize the base URL validation result
  const isBaseUrlValid = useMemo(() => {
    const baseUrlPattern = /^https:\/\/api\.altan\.ai\/galaxia\/hook\/.+/;
    return baseUrlPattern.test(config.API_BASE_URL);
  }, [config.API_BASE_URL]);

  // Validate configuration on mount
  useEffect(() => {
    // Skip validation if config hasn't changed and validation is already complete
    if (configRef.current === config && validationComplete) {
      return;
    }
    
    configRef.current = config;
    
    const validateConfig = async () => {
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
            
            if (validationResult.invalidTables?.length) {
              // Find the table names that correspond to the invalid IDs
              const invalidTableNames = Object.entries(config.SAMPLE_TABLES)
                .filter(([_, id]) => validationResult.invalidTables?.includes(id))
                .map(([name]) => name)
                .join(', ');
              
              const invalidTableIds = validationResult.invalidTables.join(', ');
              errorMessage = `Invalid tables: ${invalidTableIds} (table names: ${invalidTableNames})`;
            } else {
              errorMessage = 'One or more tables could not be found';
            }
            
            setError(errorMessage);
            setIsValidating(false);
            return;
          }
        }
        
        setIsValidating(false);
        setValidationComplete(true);
      } catch (error) {
        console.error("[DatabaseProvider] Validation error:", error);
        setError(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
        setIsValidating(false);
      }
    };
    
    validateConfig();
  }, [config, isBaseUrlValid]);

  // Create the Redux store once using useMemo, but only after validation is complete
  const store = useMemo(() => {
    // Only create store if validation passed
    if (error || isValidating) {
      return null;
    }
    
    try {
      validateDatabaseConfig(config);
      const api = authenticatedAPI ?? createAltanDB(config.API_BASE_URL);
      
      const s = configureStore({
        reducer: {
          tables: tablesReducer,
        },
        middleware: (getDefaultMiddleware: (options?: any) => Middleware[]) =>
          getDefaultMiddleware({
            thunk: {
              // Create the axios instance once using the API_BASE_URL from the provider config.
              extraArgument: { api },
            },
          }).concat(customMiddleware),
      });
      
      // Only initialize tables after validation is complete
      s.dispatch(initializeTables(config));
      return s;
    } catch (err) {
      console.error("Store creation error:", err);
      setError(`Configuration error: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, [config, customMiddleware, error, authenticatedAPI, isValidating]);

  // Handle closing the error popup
  const handleCloseError = () => {
    setError(null);
  };

  if (isValidating) {
    return null;
  }

  if (error) {
    return (
      <>
        <ErrorPopup message={error} onClose={handleCloseError} config={config} />
        <div>Unable to initialize database due to configuration errors.</div>
      </>
    );
  }

  if (!store) {
    return <div>Failed to initialize database store.</div>;
  }

  return (
    <Provider 
      store={store}
    >
      {children}
    </Provider>
  );
};

const DatabaseProvider = memo(DatabaseProviderComponent);
DatabaseProvider.displayName = "DatabaseProvider";

export {
  DatabaseProvider
};