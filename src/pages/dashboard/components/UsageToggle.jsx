import React from 'react';
import { useLocation } from 'react-router-dom';

const UsageToggle = () => {
  const [searchParams, setSearchParams] = useLocation();
  const mode = searchParams.get('mode') || 'ai';

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setSearchParams({ mode: 'ai' })}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          mode === 'ai' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        AI Usage
      </button>
      <button
        onClick={() => setSearchParams({ mode: 'tasks' })}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          mode === 'tasks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        Tasks Usage
      </button>
    </div>
  );
};

export default UsageToggle;
