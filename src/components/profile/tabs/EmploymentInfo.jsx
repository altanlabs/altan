import { Stack, TextField } from '@mui/material';
import React from 'react';

const EmploymentInfo = ({ employment, handleChange }) => {
  const handleEmploymentChange = (path, value) => {
    const newEmployment = { ...employment };

    // Helper function to set nested object values
    const setNestedValue = (obj, path, value) => {
      const keys = path.split('.');
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    };

    setNestedValue(newEmployment, path, value);
    handleChange('employment', newEmployment);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <h3>Role Information</h3>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <TextField
            fullWidth
            label="Job Title"
            value={employment?.role?.title || ''}
            onChange={(e) => handleEmploymentChange('role.title', e.target.value)}
          />
          <TextField
            fullWidth
            label="Role Description"
            value={employment?.role?.description || ''}
            onChange={(e) => handleEmploymentChange('role.description', e.target.value)}
            multiline
            rows={2}
          />
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <h3>Department Information</h3>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <TextField
            fullWidth
            label="Department Title"
            value={employment?.department?.department_type?.title || ''}
            onChange={(e) =>
              handleEmploymentChange('department.department_type.title', e.target.value)}
          />
          <TextField
            fullWidth
            label="Department Description"
            value={employment?.department?.department_type?.description || ''}
            onChange={(e) =>
              handleEmploymentChange('department.department_type.description', e.target.value)}
            multiline
            rows={2}
          />
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <h3>Company Information</h3>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
        >
          <TextField
            fullWidth
            label="Company Name"
            value={employment?.department?.company?.name || ''}
            onChange={(e) => handleEmploymentChange('department.company.name', e.target.value)}
          />
          <TextField
            fullWidth
            label="Company Website"
            value={employment?.department?.company?.website || ''}
            onChange={(e) => handleEmploymentChange('department.company.website', e.target.value)}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EmploymentInfo;
