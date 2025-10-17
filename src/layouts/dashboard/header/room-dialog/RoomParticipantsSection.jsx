import { TextField, Autocomplete, Avatar, Typography, Chip, Box } from '@mui/material';
import { UserPlus, Bot } from 'lucide-react';
import { memo } from 'react';

const RoomParticipantsSection = ({
  formData,
  isSubmitting,
  availableMembers,
  availableAgents,
  membersLoading,
  agentsLoading,
  setFormData,
}) => {
  // Custom filter for members that searches by name and email
  const filterMemberOptions = (options, { inputValue }) => {
    if (!inputValue) return options;
    const searchTerm = inputValue.toLowerCase().trim();
    return options.filter((option) => {
      const fullName = `${option.user?.first_name || ''} ${option.user?.last_name || ''}`.toLowerCase();
      const email = (option.user?.email || '').toLowerCase();
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  };

  // Custom filter for agents that searches by name (case-insensitive)
  const filterAgentOptions = (options, { inputValue }) => {
    if (!inputValue) return options;
    const searchTerm = inputValue.toLowerCase().trim();
    return options.filter((option) => {
      const agentName = (option.name || '').toLowerCase();
      return agentName.includes(searchTerm);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
          <Typography variant="body2" className="font-bold text-sm">
            Invite Members
          </Typography>
        </div>
        <Autocomplete
          multiple
          fullWidth
          disabled={isSubmitting}
          options={availableMembers}
          getOptionLabel={(option) => `${option.user.first_name} ${option.user.last_name}` || `${option.user.email}`}
          isOptionEqualToValue={(option, value) => option.user.id === value.user.id}
          filterOptions={filterMemberOptions}
          value={formData.users}
          onChange={(event, newValue) => {
            setFormData(prev => ({
              ...prev,
              users: newValue,
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search and select members..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                  borderRadius: '14px',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '2px',
                    borderColor: 'rgb(139, 92, 246)',
                  },
                  '.dark &': {
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(167, 139, 250)',
                    },
                  },
                },
              }}
            />
          )}
          loading={membersLoading}
          loadingText="Loading members..."
          noOptionsText="No members available"
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                borderRadius: '16px',
                border: '2px solid',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)',
                overflow: 'hidden',
                '.dark &': {
                  backgroundColor: 'rgba(0, 0, 0, 0.98)',
                  borderColor: 'rgba(167, 139, 250, 0.2)',
                  boxShadow: '0 20px 60px rgba(167, 139, 250, 0.2), 0 0 0 1px rgba(167, 139, 250, 0.1)',
                },
                '& .MuiAutocomplete-listbox': {
                  padding: '8px',
                  '& .MuiAutocomplete-option': {
                    borderRadius: '12px',
                    margin: '2px 0',
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  },
                },
              },
            },
          }}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <Box
                component="li"
                key={`member-${option.id || option.user?.id}`}
                {...otherProps}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.12) !important',
                    transform: 'translateX(4px)',
                    '.dark &': {
                      backgroundColor: 'rgba(167, 139, 250, 0.15) !important',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(139, 92, 246, 0.08) !important',
                    '.dark &': {
                      backgroundColor: 'rgba(167, 139, 250, 0.12) !important',
                    },
                  },
                }}
                className="!py-4 !px-4 flex items-center gap-4"
              >
                <Avatar
                  className="w-12 h-12 ring-2 ring-violet-200 dark:ring-violet-800 shadow-lg"
                  src={option.user.avatar_url}
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  {option.user.first_name?.charAt(0)}
                </Avatar>
                <Box className="flex-1 min-w-0">
                  <Typography variant="body2" className="text-sm font-bold mb-0.5 truncate">
                    {`${option.user.first_name} ${option.user.last_name}`}
                  </Typography>
                  <Typography variant="caption" className="text-xs opacity-60 truncate block">
                    {option.user.email}
                  </Typography>
                </Box>
                <div className="w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Box>
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option.user.id}
                {...getTagProps({ index })}
                avatar={<Avatar className="w-6 h-6" src={option.user.avatar_url}>{option.user.first_name?.charAt(0)}</Avatar>}
                label={`${option.user.first_name} ${option.user.last_name}`}
                size="medium"
                className="h-8 text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100"
                sx={{
                  borderRadius: '10px',
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bot size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
          <Typography variant="body2" className="font-bold text-sm">
            Invite Agents
          </Typography>
        </div>
        <Autocomplete
          multiple
          fullWidth
          disabled={isSubmitting}
          options={availableAgents}
          getOptionLabel={(option) => option.name || `Agent ${option.id}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={filterAgentOptions}
          value={formData.agents}
          onChange={(event, newValue) => {
            setFormData(prev => ({
              ...prev,
              agents: newValue,
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search and select agents..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                  borderRadius: '14px',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '2px',
                    borderColor: 'rgb(139, 92, 246)',
                  },
                  '.dark &': {
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(167, 139, 250)',
                    },
                  },
                },
              }}
            />
          )}
          loading={agentsLoading}
          loadingText="Loading agents..."
          noOptionsText="No agents available"
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                borderRadius: '16px',
                border: '2px solid',
                borderColor: 'rgba(217, 70, 239, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(217, 70, 239, 0.15), 0 0 0 1px rgba(217, 70, 239, 0.1)',
                overflow: 'hidden',
                '.dark &': {
                  backgroundColor: 'rgba(0, 0, 0, 0.98)',
                  borderColor: 'rgba(240, 171, 252, 0.2)',
                  boxShadow: '0 20px 60px rgba(240, 171, 252, 0.2), 0 0 0 1px rgba(240, 171, 252, 0.1)',
                },
                '& .MuiAutocomplete-listbox': {
                  padding: '8px',
                  '& .MuiAutocomplete-option': {
                    borderRadius: '12px',
                    margin: '2px 0',
                    padding: '12px 16px',
                    transition: 'all 0.2s ease',
                  },
                },
              },
            },
          }}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            return (
              <Box
                component="li"
                key={`agent-${option.id}`}
                {...otherProps}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(217, 70, 239, 0.12) !important',
                    transform: 'translateX(4px)',
                    '.dark &': {
                      backgroundColor: 'rgba(240, 171, 252, 0.15) !important',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(217, 70, 239, 0.08) !important',
                    '.dark &': {
                      backgroundColor: 'rgba(240, 171, 252, 0.12) !important',
                    },
                  },
                }}
                className="!py-4 !px-4 flex items-center gap-4"
              >
                <div className="relative">
                  <Avatar
                    className="w-12 h-12 ring-2 ring-fuchsia-200 dark:ring-fuchsia-800 shadow-lg"
                    src={option.avatar_url}
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    {option.name?.charAt(0)}
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-fuchsia-500 rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                    <Bot size={10} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <Box className="flex-1 min-w-0">
                  <Typography variant="body2" className="text-sm font-bold mb-0.5 truncate">
                    {option.name}
                  </Typography>
                  <Typography variant="caption" className="text-xs opacity-60">
                    AI Agent • Available
                  </Typography>
                </Box>
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 dark:bg-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Box>
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option.id}
                {...getTagProps({ index })}
                avatar={<Avatar className="w-6 h-6" src={option.avatar_url}>{option.name?.charAt(0)}</Avatar>}
                label={option.name}
                size="medium"
                className="h-8 text-sm font-medium bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-900 dark:text-fuchsia-100"
                sx={{
                  borderRadius: '10px',
                  '& .MuiChip-deleteIcon': {
                    color: 'inherit',
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
        />
      </div>
    </div>
  );
};

export default memo(RoomParticipantsSection);
