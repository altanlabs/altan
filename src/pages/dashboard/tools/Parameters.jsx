import DeleteIcon from '@mui/icons-material/Delete';
import {
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import React, { useState } from 'react';

const Parameters = ({ onParametersChange }) => {
  const [parameters, setParameters] = useState([]);

  const addParameter = () => {
    setParameters([
      ...parameters,
      { name: '', in: 'query', type: 'string', description: '', required: true },
    ]);
  };

  const updateParameter = (index, key, value) => {
    const updatedParameters = [...parameters];
    updatedParameters[index] = { ...updatedParameters[index], [key]: value };
    setParameters(updatedParameters);
    onParametersChange(updatedParameters);
  };

  const removeParameter = (index) => {
    const updatedParameters = parameters.filter((_, i) => i !== index);
    setParameters(updatedParameters);
    onParametersChange(updatedParameters);
  };

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ my: 1 }}
        >
          Parameters
        </Typography>
        {parameters.map((param, index) => (
          <div
            key={index}
            style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
          >
            <TextField
              label="Name"
              value={param.name}
              onChange={(e) => updateParameter(index, 'name', e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <TextField
              label="In"
              select
              SelectProps={{ native: true }}
              value={param.in}
              onChange={(e) => updateParameter(index, 'in', e.target.value)}
              style={{ marginRight: '10px' }}
            >
              {['query', 'header', 'path'].map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </TextField>
            <TextField
              label="Type"
              select
              SelectProps={{ native: true }}
              value={param.type}
              onChange={(e) => updateParameter(index, 'type', e.target.value)}
              style={{ marginRight: '10px' }}
            >
              {['string', 'number', 'boolean', 'object', 'array'].map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={param.description}
              onChange={(e) => updateParameter(index, 'description', e.target.value)}
              style={{ marginRight: '10px', flexGrow: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={param.required}
                  onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                />
              }
              label="Required"
              style={{ marginRight: '10px' }}
            />
            <IconButton
              color="error"
              onClick={() => removeParameter(index)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        ))}
        <Button
          fullWidth
          variant="soft"
          onClick={addParameter}
        >
          Add Parameter
        </Button>
      </CardContent>
    </Card>
  );
};

export default Parameters;
