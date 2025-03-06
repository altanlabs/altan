// src/databases/DatabaseProvider.tsx
import React, { useState } from "react";
import type { DatabaseConfig } from "../config";


interface ErrorPopupProps {
  message: string;
  onClose: () => void;
  config: DatabaseConfig
}

// Error popup component
const ErrorPopup = ({ message, onClose, config }: ErrorPopupProps) => {
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

export default ErrorPopup;