import React, { useState, useEffect } from 'react';

const DirectTest = () => {
  const [pingResult, setPingResult] = useState<string>('Testing ping...');
  const [libraryLoaded, setLibraryLoaded] = useState<boolean>(false);
  
  // Check if the library is loaded
  useEffect(() => {
    try {
      // Try to access the library
      const dbLib = require('@altanlabs/database');
      console.log('Database library loaded:', Object.keys(dbLib));
      setLibraryLoaded(true);
    } catch (err) {
      console.error('Error loading database library:', err);
      setLibraryLoaded(false);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Direct API Test</h1>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl mb-2">Library Status</h2>
        <p>Database Library Loaded: {libraryLoaded ? '✅ Yes' : '❌ No'}</p>
      </div>
      
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl mb-2">Direct Ping Test</h2>
        <pre className="whitespace-pre-wrap">{pingResult}</pre>
      </div>
    </div>
  );
};

export default DirectTest; 