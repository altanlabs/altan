import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Avatar,
  Typography,
  Divider,
} from '@mui/material';
import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAgentRoom, updateAgent } from '../../../../redux/slices/agents';
import { getSpace } from '../../../../redux/slices/spaces';
import Iconify from '../../../iconify/Iconify';
import AltanLogo from '../../../loaders/AltanLogo';

import AgentIdsList from './AgentIdsList';
import AgentModelSettings from './AgentModelSettings';
import AgentToolsList from './AgentToolsList';

const AgentDetailDialog = ({ open, onClose, agentMember }) => {
  const dispatch = useDispatch();
  const { currentAgent, isLoading } = useSelector((state) => state.agents);
  const currentSpace = useSelector((state) => state.spaces.current);
  const [agentData, setAgentData] = useState(null);

  // Fetch agent details when dialog opens
  useEffect(() => {
    if (open && agentMember?.member?.agent?.id) {
      dispatch(fetchAgentRoom(agentMember.member.agent.id));
    }
  }, [open, agentMember?.member?.agent?.id, dispatch]);

  // Fetch space/tools when agent loads
  useEffect(() => {
    if (currentAgent?.space_id && open) {
      dispatch(getSpace(currentAgent.space_id));
    }
  }, [currentAgent?.space_id, open, dispatch]);

  // Update local state when currentAgent changes
  useEffect(() => {
    if (currentAgent) {
      setAgentData(currentAgent);
    }
  }, [currentAgent]);

  // Debounced update
  const timeoutRef = useRef();
  const debouncedUpdateAgent = useCallback(
    (id, data) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(updateAgent(id, data));
      }, 500);
    },
    [dispatch],
  );

  const handleFieldChange = useCallback(
    (field, value) => {
      if (agentData) {
        const updatedData = { ...agentData, [field]: value };
        setAgentData(updatedData);
        debouncedUpdateAgent(agentData.id, { [field]: value });
      }
    },
    [agentData, debouncedUpdateAgent],
  );

  if (!agentMember) return null;

  const tools = currentSpace?.tools?.items || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={agentMember.member?.picture || agentData?.avatar_url}
            alt={agentMember.member?.name}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {agentData?.name || agentMember.member?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Agent Configuration
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {isLoading || !agentData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <AltanLogo />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Model Settings */}
            <AgentModelSettings
              agentData={agentData}
              onFieldChange={handleFieldChange}
            />

            <Divider />

            {/* Tools */}
            <AgentToolsList
              tools={tools}
              agentId={agentData?.id}
              spaceId={agentData?.space_id}
            />

            <Divider />

            {/* IDs */}
            <AgentIdsList agentData={agentData} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(AgentDetailDialog);

