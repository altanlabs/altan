import { Autocomplete, TextField, Stack, Chip, Typography, InputAdornment, Tooltip, Box, CircularProgress, Skeleton, Switch, FormControlLabel, Paper } from '@mui/material';
import { memo, useCallback, useEffect, useState, useMemo } from 'react';

import { useAccountMembers } from '../../hooks/useAccountMembers';
import { useDebounce } from '../../hooks/useDebounce';
import { selectAccount } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { CustomAvatar } from '../custom-avatar';
import Iconify from '../iconify';

const selectAccountId = (state) => selectAccount(state)?.id;

const isOptionEqualToValue = (option, value) => {
  if (!value || !option) {
    return false;
  }
  return option.id === value.id;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString();
  } catch (e) {
    return 'Invalid date';
  }
};

const MemberTooltipContent = ({ member, similarMembers = [] }) => {
  const isAgent = member.member_type === 'agent';

  return (
    <Box sx={{ p: 1, maxWidth: 300 }}>
      <Stack spacing={1.5}>
        {/* Header with avatar and name */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CustomAvatar
            sx={{ width: 48, height: 48 }}
            variant="circular"
            src={isAgent
              ? member.agent?.avatar_url
              : `https://storage.googleapis.com/logos-chatbot-optimai/user/${member.user?.id}`}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {member.name}
              {similarMembers.length > 0 && ` (${similarMembers.length + 1} instances)`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAgent ? 'AI Agent' : 'User'}
              {member.agent_id && ` • ID: ${member.agent_id.slice(0, 8)}...`}
            </Typography>
          </Box>
        </Stack>

        {/* Member details */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            MEMBER DETAILS
          </Typography>
          <Box sx={{ mt: 0.5, pl: 1 }}>
            <DetailRow label="Member ID" value={member.id} copyable />
            <DetailRow label="Created" value={formatDate(member.date_creation)} />
            {isAgent && member.agent?.date_creation && (
              <DetailRow label="Agent Created" value={formatDate(member.agent.date_creation)} />
            )}
          </Box>
        </Box>

        {/* Agent details */}
        {isAgent && member.agent && (
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
              AGENT DETAILS
            </Typography>
            <Box sx={{ mt: 0.5, pl: 1 }}>
              <DetailRow label="Status" value={member.agent.is_deleted ? 'Deleted' : 'Active'} />
              <DetailRow label="Visibility" value={member.agent.is_public ? 'Public' : 'Private'} />
              {member.agent.description && (
                <DetailRow label="Description" value={member.agent.description} />
              )}
            </Box>
          </Box>
        )}

        {/* User details */}
        {member.user?.email && (
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
              USER DETAILS
            </Typography>
            <Box sx={{ mt: 0.5, pl: 1 }}>
              <DetailRow label="Email" value={member.user.email} />
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

// Helper component for consistent detail rows
const DetailRow = ({ label, value, copyable = false }) => (
  <Box sx={{ display: 'flex', mb: 0.5 }}>
    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100, fontWeight: 500 }}>
      {label}:
    </Typography>
    {copyable ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      </Box>
    ) : (
      <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
        {value || 'N/A'}
      </Typography>
    )}
  </Box>
);

const renderOption = ({ key, ...props }, option, { selected }) => {
  const src =
    option.member_type === 'agent'
      ? option.agent?.avatar_url
      : `https://storage.googleapis.com/logos-chatbot-optimai/user/${option.user?.id}`;

  // Find similar members (same agent_id or user.id)
  const similarMembers = props.options?.filter(m =>
    (option.agent_id && m.agent_id === option.agent_id && m.id !== option.id) ||
    (option.user?.id && m.user?.id === option.user.id && m.id !== option.id),
  ) || [];

  const avatar = (
    <CustomAvatar
      sx={{
        width: 20,
        height: 20,
        border: similarMembers.length > 0 ? '2px solid #ff9800' : 'none',
      }}
      variant="circular"
      src={src}
    />
  );

  return (
    <li key={option.id} {...props}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip
          title={
            <MemberTooltipContent
              member={option}
              similarMembers={similarMembers}
            />
          }
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
          <span>{avatar}</span>
        </Tooltip>
        <Box>
          <Typography color="text.primary">
            {option.name}
            {similarMembers.length > 0 && (
              <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 1 }}>
                {similarMembers.length + 1}x
              </Typography>
            )}
          </Typography>
          {similarMembers.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {option.member_type === 'agent' ? 'Multiple instances of this agent' : 'Multiple instances of this user'}
            </Typography>
          )}
        </Box>
      </Stack>
    </li>
  );
};

const renderTags = (value, getTagProps) =>
  value.map((option, index) => {
    const src =
      option.member_type === 'agent'
        ? option.agent.avatar_url
        : `https://storage.googleapis.com/logos-chatbot-optimai/user/${option.user.id}`;
    return (
      <Tooltip
        title={<MemberTooltipContent member={option} />}
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 1,
              maxWidth: 300,
              '& .MuiTooltip-arrow': {
                color: 'background.paper',
              },
            },
          },
        }}
      >
        <Chip
          color="primary"
          icon={
            <CustomAvatar
              sx={{ width: 20, height: 20 }}
              variant={'circular'}
              src={src}
            />
          }
          label={option.name}
          size="small"
          {...getTagProps({ index })}
        />
      </Tooltip>
    );
  });

const MembersAutocomplete = ({
  value,
  onChange,
  setMembers = null, // This prop seems unused given useAccountMembers, consider removing or clarifying its role
  queryMembers = null, // This prop seems unused, consider removing or clarifying its role
  multiple = true,
  sx = {},
  label = 'Members',
  showMemberTypeFilter = true,
  ...other
}) => {
  const accountId = useSelector(selectAccountId);
  const { members, loading: membersLoading, error: membersError } = useAccountMembers({ accountId });
  const [selectedMembers, setSelectedMembers] = useState(multiple ? [] : null);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue] = useDebounce(inputValue, 300);
  const [filterAgents, setFilterAgents] = useState(true);
  const [filterUsers, setFilterUsers] = useState(true);

  // Update internal selected state when `value` changes
  useEffect(() => {
    if (!members?.length) return;

    if (multiple) {
      const newSelection = members.filter((m) => value?.includes(m.id));
      setSelectedMembers((prev) =>
        JSON.stringify(prev.map((m) => m.id)) !== JSON.stringify(value)
          ? newSelection
          : prev,
      );
    } else {
      const newSelection = members.find((m) => m.id === value) || null;
      setSelectedMembers((prev) => (prev?.id !== value ? newSelection : prev));
    }
  }, [value, members]);

  // Sync internal selection to `onChange`
  useEffect(() => {
    if (selectedMembers == null) return;

    const newValue = multiple
      ? selectedMembers.map((m) => m.id)
      : selectedMembers.id;

    if (JSON.stringify(newValue) !== JSON.stringify(value)) {
      onChange(newValue);
    }
  }, [selectedMembers]);

  const handleInputChange = useCallback(
    (event, newInputValue) => {
      setInputValue(newInputValue);
      // If queryMembers prop was intended for server-side search, it could be called here
      // For client-side, debouncedInputValue will trigger filtering in processedMembers
    },
    [],
  );

  const onAutocompleteChange = useCallback(
    (event, newMembers) => setSelectedMembers(newMembers),
    [],
  );

  const processedMembers = useMemo(() => {
    if (!members) return [];

    const lowerSearchTerm = (debouncedInputValue || '').toLowerCase();

    const filtered = members.filter((member) => {
      const isAgent = member.member_type === 'agent';
      if (isAgent && !filterAgents) return false;
      if (!isAgent && !filterUsers) return false;

      if (!lowerSearchTerm) return true;

      return (
        member.name?.toLowerCase().includes(lowerSearchTerm) ||
        member.user?.email?.toLowerCase().includes(lowerSearchTerm) ||
        member.id?.toLowerCase().includes(lowerSearchTerm) ||
        member.agent_id?.toLowerCase().includes(lowerSearchTerm)
      );
    });

    return filtered.sort((a, b) => {
      const typeA = a.member_type === 'agent' ? 0 : 1;
      const typeB = b.member_type === 'agent' ? 0 : 1;
      if (typeA !== typeB) return typeA - typeB; // Agents first, then users
      return (a.name || '').localeCompare(b.name || ''); // Then by name
    });
  }, [members, debouncedInputValue, filterAgents, filterUsers]);

  const renderCustomOption = (props, option, { selected }) => {
    const { key, ...liProps } = props; // Extract key from props to pass directly
    const src =
      option.member_type === 'agent'
        ? option.agent?.avatar_url
        : `https://storage.googleapis.com/logos-chatbot-optimai/user/${option.user?.id}`;

    // Find similar members (same agent_id or user.id)
    const similarMembers = processedMembers.filter(m =>
      m.id !== option.id && // Exclude the option itself
      ((
        option.agent_id &&
        m.agent_id === option.agent_id
      ) ||
      (
        option.user?.id &&
        m.user?.id === option.user.id
      )),
    ) || [];

    const optionContent = (
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
        <CustomAvatar
          sx={{
            width: 32,
            height: 32,
            border: similarMembers.length > 0 ? '2px solid #ff9800' : 'none', // Highlight if similar members exist
          }}
          variant="circular"
          src={src}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}> {/* Added minWidth to prevent overflow issues with noWrap */}
          <Typography variant="subtitle2" noWrap>
            {option.name}
            {similarMembers.length > 0 && (
              <Typography component="span" variant="caption" color="warning.main" sx={{ ml: 0.5 }}>
                ({similarMembers.length + 1}x)
              </Typography>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {option.member_type === 'agent' ?
                (option.agent?.description || `Agent ID: ${option.agent_id?.slice(0, 8)}...`) :
                (option.user?.email || `User ID: ${option.user?.id?.slice(0, 8)}...`)}
          </Typography>
        </Box>
        {selected && <Iconify icon="eva:checkmark-fill" sx={{ color: 'primary.main', flexShrink: 0 }} />}
      </Stack>
    );

    return (
      <li key={option.id} {...liProps}>
        <Tooltip
          title={<MemberTooltipContent member={option} similarMembers={similarMembers} />}
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
          {/* Wrapping div needed for Tooltip to correctly anchor on complex children like Stack with flex properties */}
          <div style={{ width: '100%' }}>
            {optionContent}
          </div>
        </Tooltip>
      </li>
    );
  };

  const CustomPaper = (props) => (
    <Paper {...props}>
      {showMemberTypeFilter && (
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} justifyContent="space-around">
            <FormControlLabel
              control={<Switch size="small" checked={filterAgents} onChange={(e) => setFilterAgents(e.target.checked)} />}
              label={<Typography variant="caption">Agents</Typography>}
            />
            <FormControlLabel
              control={<Switch size="small" checked={filterUsers} onChange={(e) => setFilterUsers(e.target.checked)} />}
              label={<Typography variant="caption">Users</Typography>}
            />
          </Stack>
        </Box>
      )}
      {props.children}
    </Paper>
  );

  if (membersLoading && !members?.length) { // Initial loading state
    return (
      <Stack spacing={1} sx={sx}>
        <Skeleton variant="text" width={100} sx={{ fontSize: '0.75rem' }} />
        <Skeleton variant="rectangular" height={40} />
        {showMemberTypeFilter && (
          <Stack direction="row" spacing={2} justifyContent="space-around" sx={{ p: 1 }}>
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={80} />
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Autocomplete
      sx={sx}
      fullWidth
      size="small"
      multiple={multiple}
      options={processedMembers}
      value={selectedMembers}
      groupBy={(option) => option.member_type === 'agent' ? 'Agents' : 'Users'}
      getOptionLabel={(option) => option?.name || 'Unknown'}
      onChange={onAutocompleteChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderCustomOption}
      renderTags={renderTags} // Assuming renderTags is defined elsewhere and handles multiple selections well
      loading={membersLoading} // Show loading indicator in input if members are still loading/refetching
      // PaperComponent={CustomPaper}
      ListboxProps={{ style: { maxHeight: 300 } }} // Control dropdown height
      noOptionsText={
        membersError ? 'Error loading members' :
            (!filterAgents && !filterUsers) ? 'Enable Agent or User filter' :
                (debouncedInputValue ? `No members found for "${debouncedInputValue}"` : 'No members available')
      }
      renderInput={(params) => {
        const singleSelectedSrc =
          !multiple &&
          selectedMembers && // Ensure selectedMembers is not null or an empty array
          (selectedMembers.member_type === 'agent'
            ? (selectedMembers.agent?.avatar_url ?? null)
            : selectedMembers.user && // Ensure user object exists
            `https://storage.googleapis.com/logos-chatbot-optimai/user/${selectedMembers.user.id}`);

        return (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {!multiple && selectedMembers && singleSelectedSrc && (
                    <InputAdornment position="start" sx={{ pl: 0.5 }}>
                      <Tooltip
                        title={<MemberTooltipContent member={selectedMembers} />}
                        arrow
                        placement="bottom-start"
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
                        {/* Span needed for Tooltip to correctly anchor on CustomAvatar */}
                        <span>
                          <CustomAvatar
                            sx={{ width: 24, height: 24, cursor: 'default' }}
                            src={singleSelectedSrc}
                          />
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  )}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {membersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        );
      }}
      {...other}
    />
  );
};

export default memo(MembersAutocomplete);
