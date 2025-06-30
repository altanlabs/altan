import { Stack } from '@mui/material';
import React, { memo } from 'react';

import FormParameters from '../../form/FormParameters';
import { useDynamicFormLoaderSchema } from '../hooks';

// Spinner Component
const Spinner = ({ label }) => (
  <div className="flex items-center gap-3 p-4 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md shadow">
    <svg
      className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
    <span>{label}</span>
  </div>
);

// Main Component
const SchemaFormLoader = ({ schema_url, path, name, args = {}, request = {}, response = {} }) => {
  const { schema, loading, error } = useDynamicFormLoaderSchema(
    schema_url,
    args,
    request,
    response,
  );

  console.log('schema', schema);
  console.log('path', path);

  if (loading) {
    return <Spinner label={`Loading schema for ${name}...`} />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 rounded-md shadow">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!schema) {
    return null;
  }

  return (
    <Stack
      spacing={1}
      height="100%"
      width="100%"
    >
      <FormParameters
        formSchema={schema}
        path={`${path}.`}
      />
    </Stack>
  );
};

export default memo(SchemaFormLoader);
