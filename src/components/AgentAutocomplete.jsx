import { Box, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { CustomAvatar } from './custom-avatar';
import { useSelector } from '../redux/store';
import Iconify from './iconify/Iconify';
import { useDebounce } from '../hooks/useDebounce.js';

const selectAccountAgents = (state) => state.general.account.agents;

const SkeletonLoading = (
  <Skeleton
    variant="rectangular"
    width="100%"
    height={30}
    style={{ borderRadius: 5 }}
  />
);

// Helper to format dates, similar to MembersAutocomplete
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(); // Using toLocaleDateString for brevity
  } catch {
    return 'Invalid date';
  }
};

// DetailRow component for consistent layout in Tooltip
const DetailRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', mb: 0.5 }}>
    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

const AgentTooltipContent = ({ agent }) => {
  if (!agent) return null;
  return (
    <Box sx={{ p: 1.5, maxWidth: 320 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CustomAvatar
            sx={{ width: 48, height: 48 }}
            variant="circular"
            src={agent.avatar_url}
            name={agent.name}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {agent.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Agent ID: {agent.id?.slice(0, 8)}...
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            AGENT DETAILS
          </Typography>
          <Box sx={{ mt: 0.5, pl: 1 }}>
            <DetailRow label="Status" value={agent.is_deleted ? 'Deleted' : 'Active'} />
            <DetailRow label="Visibility" value={agent.is_public ? 'Public' : 'Private'} />
            {agent.description && (
              <DetailRow label="Description" value={agent.description} />
            )}
            <DetailRow label="Created" value={formatDate(agent.date_creation)} />
            {/* Add other relevant agent details here if available */}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

const renderTagsWithTooltip = (value, getTagProps) =>
  value.map((option, index) => {
    const { key, ...chipProps } = getTagProps({ index });
    return (
      <Tooltip
        key={option.id} // Use agent id for key if available and unique
        title={<AgentTooltipContent agent={option} />}
        arrow
      >
        <Chip
          // key={key} // key is now on Tooltip
          label={option.name}
          icon={
            <CustomAvatar // Using CustomAvatar for consistency
              sx={{ width: 20, height: 20 }}
              variant={'circular'}
              src={option.avatar_url}
              name={option.name}
            />
          }
          {...chipProps}
        />
      </Tooltip>
    );
  });

const renderCustomAgentOption = ({ key, ...liProps }, option, { selected }) => {
  const src = option.avatar_url;
  return (
    <li key={option.id || key} {...liProps}>
      <Tooltip
        title={<AgentTooltipContent agent={option} />}
        arrow
        placement="right"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 2,
              maxWidth: 350,
              '& .MuiTooltip-arrow': {
                color: 'background.paper',
              },
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5} // Increased spacing a bit
          alignItems="center"
          sx={{ width: '100%', p: 0.5 }} // Added some padding
        >
          <CustomAvatar
            name={option.name}
            src={src}
            sx={{ width: 32, height: 32 }} // Slightly larger avatar
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {option.description?.substring(0, 30) || `ID: ${option.id?.slice(0, 8)}...`}
            </Typography>
          </Box>
          <IconButton
            component={RouterLink}
            to={`/agent/${option.id}`}
            target="_blank"
            onClick={(e) => e.stopPropagation()} // Keep click from selecting option
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <Iconify icon="eva:external-link-fill" width={18} />
          </IconButton>
          {selected && <Iconify icon="eva:checkmark-fill" sx={{ color: 'primary.main', flexShrink: 0 }} />}
        </Stack>
      </Tooltip>
    </li>
  );
};

// Original renderOption can be removed or kept if there's a specific use case elsewhere
// For now, let's assume it's replaced by renderCustomAgentOption
/*
const renderOption = ({ key, ...props }, option) => (
  <li
    key={key}
    {...props}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ width: '100%' }}
    >
      <CustomAvatar
        name={option.name}
        src={option.avatar_url}
        sx={{ width: 24, height: 24 }}
      />
      <Typography
        color={'text.primary'}
        sx={{ flex: 1 }}
      >
        {option.name}
      </Typography>
      <IconButton
        component={RouterLink}
        to={`/agent/${option.id}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        size="small"
      >
        <Iconify
          icon="eva:external-link-fill"
          width={20}
        />
      </IconButton>
    </Stack>
  </li>
);
*/

const isOptionEqualToValue = (option, value) => option.id === value?.id;
const getOptionLabel = (option) => option.name;
const getOptionKey = (option) => option.id;

const AgentAutocomplete = ({ onChange, value, multiple = false, label = multiple ? 'Select AI Agents' : 'Select an AI Agent' }) => {
  const allAgents = useSelector(selectAccountAgents);
  const [isSelecting, setIsSelecting] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const debouncedInputValue = useDebounce(inputValue, 300);

  const processedAgents = useMemo(() => {
    if (!allAgents) return [];
    const lowerSearchTerm = (debouncedInputValue || '').toLowerCase();

    const filtered = allAgents.filter((agent) => {
      if (!lowerSearchTerm) return true; // Show all if no search term
      return (
        agent.name?.toLowerCase().includes(lowerSearchTerm) ||
        agent.id?.toLowerCase().includes(lowerSearchTerm) ||
        agent.description?.toLowerCase().includes(lowerSearchTerm)
      );
    });

    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allAgents, debouncedInputValue]);

  const handleChange = useCallback(
    (event, newValue) => {
      if (multiple) {
        onChange(newValue.map((e) => e.id));
      } else {
        onChange(newValue ? newValue.id : null);
      }
    },
    [multiple, onChange],
  );

  const selectedValue = useMemo(
    () =>
      multiple
        ? allAgents?.filter((a) => value?.includes(a.id))
        : allAgents?.find((a) => a.id === value) || null,
    [allAgents, multiple, value],
  );

  const onBackToSelection = useCallback(() => setIsSelecting(true), []);

  const renderInput = useCallback(
    (params) => {
      const showSelectedAgentDisplay = !multiple && selectedValue;

      // Adjust inputProps value and placeholder based on selection
      const inputProps = { ...params.inputProps };
      let currentPlaceholder = multiple ? 'Search by name, ID, or description...' : 'Search or select an AI Agent...';
      if (showSelectedAgentDisplay) {
        inputProps.value = ''; // Clear the actual input value as the chip displays it
        currentPlaceholder = ''; // No placeholder when an item is selected and displayed as a chip
      }

      return (
        <TextField
          {...params}
          label={label}
          placeholder={currentPlaceholder}
          variant="filled"
          inputProps={inputProps} // Pass modified inputProps
          sx={{
            // Ensure the TextField is interactive even when the input is visually empty
            ...(showSelectedAgentDisplay && {
              '& .MuiFilledInput-root': {
                cursor: 'pointer',
              },
            }),
            '.MuiInputBase-input': {
              '&::placeholder': {
                fontStyle: 'italic',
                fontSize: '0.8rem',
                opacity: 0.7,
              },
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {showSelectedAgentDisplay && (
                  <InputAdornment
                    position="start"
                    sx={{
                      ml: 0.5,
                      my: 0.5,
                      mr: 0.75,
                      height: 'auto',
                      width: 'auto',
                    }}
                  >
                    <Tooltip title={<AgentTooltipContent agent={selectedValue} />} arrow placement="bottom-start">
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSelecting(false); // Switch to edit view
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          p: '2px 6px',
                          borderRadius: '16px', // Pill shape
                          backgroundColor: (theme) => theme.palette.action.hover, // Subtle background
                          transition: 'background-color 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: (theme) => theme.palette.action.selected, // Darker on hover
                          },
                        }}
                      >
                        <CustomAvatar
                          name={selectedValue.name}
                          src={selectedValue.avatar_url}
                          sx={{ width: 24, height: 24, mr: 0.75 }}
                        />
                        <Typography variant="body2" noWrap sx={{ lineHeight: 'normal' }}>
                          {selectedValue.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </InputAdornment>
                )}
                {/* Preserve MUI's start adornments if any (e.g., for multiple=true chips) */}
                {/* This ensures that if Autocomplete itself adds start adornments (like chips for multiple), they are not lost. */}
                {/* However, for single select, params.InputProps.startAdornment is usually undefined unless explicitly added by Autocomplete. */}
                {/* We are effectively replacing the visual input with our chip for single select. */}
                {!showSelectedAgentDisplay && params.InputProps.startAdornment}
              </>
            ),
            // Only use MUI's default end adornments (clear, dropdown arrow)
            // Our custom edit icon is removed.
            endAdornment: params.InputProps.endAdornment,
          }}
        />
      );
    },
    [multiple, selectedValue, label, setIsSelecting],
  );

  if (multiple || isSelecting || !selectedValue) {
    return (
      <Stack
        spacing={0.5}
        width="100%"
      >
        {/* Loading state could be added here if allAgents is initially undefined */}
        {allAgents ? (
          processedAgents.length > 0 || inputValue ? (
            <Autocomplete
              size="small"
              id="agent-autocomplete"
              options={processedAgents} // Use processed (filtered and sorted) agents
              multiple={multiple}
              isOptionEqualToValue={isOptionEqualToValue}
              getOptionLabel={getOptionLabel} // MUI uses this for input text if not controlled, and for equality checks
              getOptionKey={getOptionKey}
              renderInput={renderInput}
              value={selectedValue}
              onChange={handleChange} // Handles selection of an agent
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input') {
                  setInputValue(newInputValue);
                }
              }} // Handles typing in the input
              inputValue={inputValue} // Controlled input value
              renderOption={renderCustomAgentOption} // Custom rendering for each option
              renderTags={renderTagsWithTooltip} // Custom rendering for selected tags
              filterOptions={(x) => x} // Options are already filtered by processedAgents
              noOptionsText={!inputValue ? 'No agents found.' : `No agents match "${inputValue}"`}
              PaperComponent={({ children }) => (
                <Paper elevation={3}>{children}</Paper> // Add some elevation to dropdown
              )}
              PopperProps={{
                style: {
                  zIndex: 99999,
                },
                placement: 'bottom-start',
              }}
              slotProps={{
                popper: {
                  style: {
                    zIndex: 99999,
                  },
                },
              }}
            // Consider adding loading and loadingText props if allAgents fetch is async
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No agents available. You can create one below.
            </Typography>
          )
        ) : (
          SkeletonLoading // Show skeleton if allAgents is not yet available
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Button
        size="small"
        startIcon={<Iconify icon="eva:arrow-back-fill" />}
        onClick={onBackToSelection}
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to selection
      </Button>
    </Stack>
  );
};

export default memo(AgentAutocomplete);
