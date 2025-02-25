// src/databases/DatabaseProvider.tsx
import React, { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import tablesReducer from "./tablesSlice";
import type { DatabaseConfig } from "../config";
import { validateDatabaseConfig } from "../config";
import { initializeTables } from "./tablesSlice";
import { createAltanDB } from "../api/axios";
import axios from "axios";

interface DatabaseProviderProps {
  config: DatabaseConfig;
  children: ReactNode;
  enableDevTools?: boolean; // Add option to disable Redux DevTools
  customMiddleware?: Array<any>; // Allow custom middleware
}

// Error popup component
const ErrorPopup = ({ message, onClose, config }: { message: string; onClose: () => void; config: DatabaseConfig }) => {
  const [copied, setCopied] = useState(false);
  
  // Helper function to find invalid table IDs by comparing with the error message
  const getInvalidTableInfo = () => {
    if (message.includes('Invalid tables:')) {
      return {
        ids: message.split('(')[0].replace('Invalid tables:', '').trim(),
        names: message.split('table names:')[1]?.replace(')', '').trim() || ''
      };
    }
    
    // For the generic error message, find invalid tables by checking all table IDs
    const allTableEntries = Object.entries(config.SAMPLE_TABLES);
    const invalidEntries = allTableEntries.filter(([_, id]) => 
      id.length > 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );
    
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
  
  return (
    <div style={{
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
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        fontSize: '16px', 
        marginBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        paddingBottom: '5px'
      }}>
        Database Configuration Error
      </div>
      
      <div style={{ marginBottom: '15px' }}>{getUserMessage()}</div>
      
      <div style={{ 
        backgroundColor: 'rgba(0,0,0,0.1)', 
        padding: '10px', 
        borderRadius: '4px',
        fontSize: '14px',
        marginBottom: '15px'
      }}>
        <strong>Need help?</strong> Click the "Copy Error" button below and paste it to the AI assistant in chat for troubleshooting assistance.
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={copyToClipboard}
          style={{
            backgroundColor: copied ? '#4CAF50' : 'white',
            color: copied ? 'white' : '#f44336',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {copied ? 'Copied!' : 'Copy Error'}
        </button>
        
        <button 
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

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

export const DatabaseProvider = ({
  config,
  children,
  customMiddleware = [],
}: DatabaseProviderProps): JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const configRef = useRef(config);
  const [validationComplete, setValidationComplete] = useState(false);

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
      
      const s = configureStore({
        reducer: {
          tables: tablesReducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            thunk: {
              // Create the axios instance once using the API_BASE_URL from the provider config.
              extraArgument: { api: createAltanDB(config.API_BASE_URL) },
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
  }, [config, customMiddleware, error, isValidating]);

  // Handle closing the error popup
  const handleCloseError = () => {
    setError(null);
  };

  if (isValidating) {
    return <div>Validating database configuration...</div>;
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

  return <Provider store={store}>{children}</Provider>;
};
