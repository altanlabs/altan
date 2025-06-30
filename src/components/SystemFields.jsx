import { Checkbox, FormControlLabel, Grid, Radio, RadioGroup, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';

const personFields = [
  'nickname',
  'avatar_url',
  'first_name',
  'last_name',
  'identification',
  'gender',
  'birthday',
  'fiscal_id',
  'about',
  'headline',
  'personal_email',
  'personal_phone',
  'personal_address',
  'social_media',
];

const companyFields = [
  'company_name',
  'company_website',
  'logo_url',
  'company_about',
  'company_fiscal_id',
  'company_email',
  'company_phone',
  'company_social_media',
  'company_departments',
  'business_categories',
];

export default function SystemFields({ onChange, value }) {
  const [selectedType, setSelectedType] = useState('person');
  const [selectedFields, setSelectedFields] = useState([]);

  // Initialize the component with value if provided
  useEffect(() => {
    if (value) {
      const fieldsArray = value.split(' ');
      setSelectedFields(fieldsArray);
      // Set the type based on which set contains any of the initialized fields
      setSelectedType(
        personFields.some((field) => fieldsArray.includes(field)) ? 'person' : 'company',
      );
    }
  }, [value]);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedFields([]); // Reset fields when type changes
  };

  const handleFieldChange = (event) => {
    const { checked, value } = event.target;
    setSelectedFields((prev) =>
      checked ? [...prev, value] : prev.filter((field) => field !== value),
    );
  };

  const fields = selectedType === 'person' ? personFields : companyFields;

  useEffect(() => {
    onChange && onChange(selectedFields.join(' '));
  }, [selectedFields, onChange]);

  return (
    <div style={{ padding: 2 }}>
      <RadioGroup
        row
        value={selectedType}
        onChange={handleTypeChange}
      >
        <FormControlLabel
          value="person"
          control={<Radio />}
          label="Person"
        />
        <FormControlLabel
          value="company"
          control={<Radio />}
          label="Company"
        />
      </RadioGroup>
      <Divider style={{ margin: '10px 0' }} />
      <Grid container>
        {fields.map((field) => (
          <Grid item>
            <FormControlLabel
              key={field}
              control={
                <Checkbox
                  checked={selectedFields.includes(field)}
                  onChange={handleFieldChange}
                  value={field}
                />
              }
              label={field.replace(/_/g, ' ')}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
