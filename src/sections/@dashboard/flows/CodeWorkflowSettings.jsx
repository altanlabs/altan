import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

import Iconify from '../../../components/iconify';

const CodeWorkflowSettings = ({ codeModule, onCodeModuleUpdate, expanded, onExpandedChange }) => {
  // Code module state
  const [dependencies, setDependencies] = useState([]);
  const [outputVars, setOutputVars] = useState([]);
  const [newDependency, setNewDependency] = useState('');
  const [newOutputVar, setNewOutputVar] = useState({ name: '', type: 'string' });
  const [editingVar, setEditingVar] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with code module data
  useEffect(() => {
    if (codeModule?.logic) {
      setDependencies(codeModule.logic.dependencies || []);
      setOutputVars(codeModule.logic.output_vars_schema || []);
    }
  }, [codeModule]);

  // Code module handlers
  const handleAddDependency = useCallback(() => {
    if (newDependency.trim() && !dependencies.includes(newDependency.trim())) {
      const updatedDependencies = [...dependencies, newDependency.trim()];
      setDependencies(updatedDependencies);
      setNewDependency('');
      setHasChanges(true);
    }
  }, [newDependency, dependencies]);

  const handleRemoveDependency = useCallback(
    (index) => {
      const updatedDependencies = dependencies.filter((_, i) => i !== index);
      setDependencies(updatedDependencies);
      setHasChanges(true);
    },
    [dependencies],
  );

  const handleAddOutputVar = useCallback(() => {
    if (newOutputVar.name.trim() && !outputVars.find((v) => v.name === newOutputVar.name.trim())) {
      const updatedOutputVars = [
        ...outputVars,
        { ...newOutputVar, name: newOutputVar.name.trim() },
      ];
      setOutputVars(updatedOutputVars);
      setNewOutputVar({ name: '', type: 'string' });
      setHasChanges(true);
    }
  }, [newOutputVar, outputVars]);

  const handleRemoveOutputVar = useCallback(
    (index) => {
      const updatedOutputVars = outputVars.filter((_, i) => i !== index);
      setOutputVars(updatedOutputVars);
      setHasChanges(true);
    },
    [outputVars],
  );

  const handleEditOutputVar = useCallback(
    (index, field, value) => {
      const updatedOutputVars = [...outputVars];
      updatedOutputVars[index] = { ...updatedOutputVars[index], [field]: value };
      setOutputVars(updatedOutputVars);
      setHasChanges(true);
    },
    [outputVars],
  );

  const handleSaveChanges = useCallback(() => {
    onCodeModuleUpdate?.({ dependencies, output_vars_schema: outputVars });
    setHasChanges(false);
  }, [dependencies, outputVars, onCodeModuleUpdate]);

  const handleKeyPress = useCallback((e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  }, []);

  if (!codeModule) return null;

  return (
    <Accordion
      expanded={expanded}
      onChange={onExpandedChange}
      elevation={0}
      sx={{ boxShadow: 'none' }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        sx={{ px: 2, py: 1 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flex: 1 }}
        >
          <Iconify icon="mdi:code" />
          <Typography variant="subtitle2">Code Settings</Typography>
          {hasChanges && (
            <Chip
              size="small"
              label="Unsaved"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0 }}>
        <Stack spacing={3}>
          {/* Save Button */}
          {hasChanges && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:content-save" />}
              onClick={handleSaveChanges}
              fullWidth
            >
              Save Changes
            </Button>
          )}
          {/* Dependencies */}
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              gutterBottom
            >
              Dependencies
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              mb={1}
            >
              <TextField
                size="small"
                placeholder="e.g., requests, pandas"
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddDependency)}
                sx={{ flex: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={handleAddDependency}
                disabled={!newDependency.trim()}
              >
                Add
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              gap={1}
            >
              {dependencies.map((dep, index) => (
                <Chip
                  key={index}
                  label={dep}
                  size="small"
                  onDelete={() => handleRemoveDependency(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
            {dependencies.length === 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                No dependencies added yet
              </Typography>
            )}
          </Box>

          {/* Output Variables */}
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              gutterBottom
            >
              Output Variables
            </Typography>
            <Stack
              spacing={1}
              mb={1}
            >
              <Stack
                direction="row"
                spacing={1}
              >
                <TextField
                  size="small"
                  placeholder="Variable name"
                  value={newOutputVar.name}
                  onChange={(e) => setNewOutputVar({ ...newOutputVar, name: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleAddOutputVar)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  select
                  size="small"
                  value={newOutputVar.type}
                  onChange={(e) => setNewOutputVar({ ...newOutputVar, type: e.target.value })}
                  sx={{ minWidth: 100 }}
                >
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="object">Object</MenuItem>
                  <MenuItem value="array">Array</MenuItem>
                </TextField>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAddOutputVar}
                  disabled={!newOutputVar.name.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Stack>
            <Stack spacing={1}>
              {outputVars.map((variable, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {editingVar === index ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flex: 1 }}
                    >
                      <TextField
                        size="small"
                        value={variable.name}
                        onChange={(e) => handleEditOutputVar(index, 'name', e.target.value)}
                        onBlur={() => setEditingVar(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingVar(null)}
                        autoFocus
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        select
                        size="small"
                        value={variable.type}
                        onChange={(e) => handleEditOutputVar(index, 'type', e.target.value)}
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value="string">String</MenuItem>
                        <MenuItem value="number">Number</MenuItem>
                        <MenuItem value="boolean">Boolean</MenuItem>
                        <MenuItem value="object">Object</MenuItem>
                        <MenuItem value="array">Array</MenuItem>
                      </TextField>
                    </Stack>
                  ) : (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => setEditingVar(index)}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {variable.name}
                      </Typography>
                      <Chip
                        label={variable.type}
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        sx={{ ml: 'auto !important' }}
                      >
                        <Iconify
                          icon="mdi:pencil"
                          width={14}
                        />
                      </IconButton>
                    </Stack>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveOutputVar(index)}
                    color="error"
                  >
                    <Iconify icon="mdi:close" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            {outputVars.length === 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                No output variables defined yet
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default CodeWorkflowSettings;
