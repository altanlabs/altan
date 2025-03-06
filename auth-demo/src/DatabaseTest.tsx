import React from "react";
import { DatabaseProvider, useDatabase } from "@altanlabs/database";

// Component that uses the database hook
const DatabaseContent = () => {
  const { records, isLoading, error } = useDatabase("clients");
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Database Records</h2>
      <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(records, null, 2)}
      </pre>
    </div>
  );
};

// Test configuration
const databaseConfig = {
  API_BASE_URL: "https://api.altan.ai/galaxia/hook/yShgfr",
  SAMPLE_TABLES: {
    clients: "df96d87f-7666-4751-965a-a844c184c1deaskjdaksjdaksjd",
    workspaces: "dd8011fa-e61e-48af-a59c-614aad189f12",
    subscriptions: "ee583ea8-f1dd-449d-9792-7df549c32bce",
    invoices: "5d0095b9-1bbc-4ec5-aa4b-687f825145a3",
    final_clients: "bc4e8523-1666-4573-ba09-84c4b236c005"
  }
};

// Test component with different error scenarios
export const DatabaseTest = () => {
  // Valid configuration
  const validConfig = { ...databaseConfig };
  
  // Invalid URL format (missing @ prefix)
  const invalidUrlConfig = { 
    ...databaseConfig,
    API_BASE_URL: "https://api.altan.ai/galaxia/hook/yShgfr" // Missing @ prefix
  };
  
  // Invalid table ID
  const invalidTableConfig = {
    ...databaseConfig,
    SAMPLE_TABLES: {
      ...databaseConfig.SAMPLE_TABLES,
      clients: "invalid-table-id-that-doesnt-exist"
    }
  };
  
  // Choose which config to test
  const testConfig = validConfig; // Change to test different scenarios
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Database Provider Test</h1>
      <DatabaseProvider config={testConfig}>
        <DatabaseContent />
      </DatabaseProvider>
    </div>
  );
};

export default DatabaseTest; 