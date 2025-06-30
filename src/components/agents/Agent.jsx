import { LoadingButton } from '@mui/lab';
import {
  Box,
  useTheme,
  Stack,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, memo } from 'react';
import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';

import AgentNew from './AgentNew';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import useMessageListener from '../../hooks/useMessageListener';
import DeleteDialog from '../../pages/dashboard/superadmin/tables/DeleteDialog';
import { deleteAccountAgent, createTemplate } from '../../redux/slices/general';
import useAgentAttributes from '../../sections/@dashboard/agents/useAgentAttributes';
import { optimai, optimai_room } from '../../utils/axios';
import Iconify from '../iconify';
import AltanLogo from '../loaders/AltanLogo';
import ShareAgentDialog from '../members/ShareAgentDialog';
import TemplateDialog from '../templates/TemplateDialog';

const CreationMode = {
  MANUAL: 'manual',
  CHAT: 'chat',
};

// Selector to get agents from Redux store
const selectAgents = (state) => state.general.account?.agents;
const versionsSelector = (template) => template?.versions?.items;

function Agent({ agentId, id, altanerComponentId, onGoBack }) {
  // Accept both agentId and id props to be compatible with both direct use and navigation
  const currentAgentId = agentId || id;
  const theme = useTheme();
  const [creationMode, setCreationMode] = useState(CreationMode.MANUAL);
  const agents = useSelector(selectAgents);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fetchedRoomId, setFetchedRoomId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [creatorRoomId, setCreatorRoomId] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAgentRooms = async () => {
      if (currentAgentId) {
        setIsLoading(true);
        try {
          const foundAgent = agents?.find((a) => a.id.toString() === currentAgentId.toString());
          if (foundAgent) {
            setCurrentAgent(foundAgent);

            // Fetch the agent's DM room
            const dmResponse = await optimai.get(
              `/agent/${foundAgent.id}/dm?account_id=${foundAgent.account_id}`,
            );
            setFetchedRoomId(dmResponse.data.id);

            // Fetch the creator room
            const creatorResponse = await optimai_room.get(
              `/external/agent_${currentAgentId}?account_id=${foundAgent.account_id}&autocreate=true`,
            );
            setCreatorRoomId(creatorResponse.data.room.id);
          }
        } catch (error) {
          console.error('Error fetching agent rooms:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAgentRooms();
  }, [currentAgentId, agents]);

  const handleDelete = () => {
    dispatchWithFeedback(deleteAccountAgent(currentAgentId), {
      successMessage: 'Agent deleted successfully',
      errorMessage: 'Unexpected error: ',
      useSnackbar: true,
    }).then(() => {
      onGoBack();
    });
  };

  const handleCopy = useCallback((data) => {
    try {
      navigator.clipboard.writeText(data);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, []);

  const handleMessage = useCallback(
    (event) => {
      if (event.data.type === 'COPY_TO_CLIPBOARD') handleCopy(event.data.text);
    },
    [handleCopy],
  );

  useMessageListener(['https://app.altan.ai'], handleMessage);

  // Initialize agent attributes hook with proper mode and agent data
  const { AgentAttributes, triggerSubmit } = useAgentAttributes({
    mode: 'update',
    agent: currentAgent,
  });

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setCreationMode(newMode);
    }
  };

  const handleTemplate = useCallback(() => {
    if (!currentAgent) return;

    if (currentAgent?.cloned_template_id) {
      console.log('agent cloned');
      return;
    }
    if (currentAgent?.template) {
      setTemplateDialogOpen(true);
    } else {
      const data = {
        id: currentAgent?.id,
        entity_type: 'agent',
      };
      dispatchWithFeedback(createTemplate(data), {
        successMessage: 'Agent template created successfully',
        errorMessage: 'There was an error creating agent template',
      });
    }
  }, [currentAgent, dispatchWithFeedback]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await triggerSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the templateSelector with a safety check
  const templateSelector = useCallback(() => currentAgent?.template, [currentAgent]);

  if (isLoading) {
    return (
      <AltanLogo
        wrapped
        showProgress
      />
    );
  }

  if (!currentAgent && altanerComponentId) {
    return <AgentNew altanerComponentId={altanerComponentId} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
      }}
    >
      {/* Left side with header and content */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Header with buttons */}
        <Box
          sx={{
            py: 1,
            px: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 48,
          }}
        >
          {!altanerComponentId && (
            <Tooltip title="Back to agents">
              <IconButton onClick={onGoBack}>
                <Iconify icon="mdi:arrow-left" />
              </IconButton>
            </Tooltip>
          )}
          {/* <ToggleButtonGroup
            value={creationMode}
            exclusive
            onChange={handleModeChange}
            aria-label="creation mode"
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                py: 0.5,
                px: 1.5,
              },
            }}
          >
            <ToggleButton value={CreationMode.MANUAL}>Manual Creation</ToggleButton>
            <ToggleButton value={CreationMode.CHAT}>Chat Creator</ToggleButton>
          </ToggleButtonGroup> */}
          <Stack
            direction="row"
            spacing={0}
          >
            <Tooltip title="Delete agent">
              <IconButton
                variant="contained"
                color="error"
                onClick={() => setDeleteDialog(true)}
              >
                <Iconify icon="mdi:trash" />
              </IconButton>
            </Tooltip>

            {!currentAgent?.cloned_template_id && (
              <Tooltip
                arrow
                followCursor
                title={
                  !currentAgent?.template ? 'Create template from agent' : 'View agent versions'
                }
              >
                <IconButton
                  id="marketplace"
                  variant="soft"
                  onClick={handleTemplate}
                >
                  <Iconify icon="mdi:history" />
                </IconButton>
              </Tooltip>
            )}
            <Button
              variant="standard"
              color="primary"
              startIcon={<Iconify icon="mdi:share" />}
              onClick={() => setShareDialogOpen(true)}
            >
              Share
            </Button>
            <LoadingButton
              loading={isSubmitting}
              onClick={handleSubmit}
              startIcon={<Iconify icon="mingcute:save-fill" />}
              variant="soft"
              color="primary"
            >
              Save
            </LoadingButton>
          </Stack>
        </Box>

        {/* Content area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {creationMode === CreationMode.MANUAL ? (
            <Box sx={{ p: 2 }}>{AgentAttributes}</Box>
          ) : (
            creatorRoomId && (
              <iframe
                allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
                src={`https://app.altan.ai/room/${creatorRoomId}?theme=${theme.palette.mode}&header=false`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="AI Agent Creator Chat"
              />
            )
          )}
        </Box>
      </Box>
      {/* Right side: Chat room preview */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
        }}
      >
        {fetchedRoomId && (
          <iframe
            allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
            src={`https://app.altan.ai/room/${fetchedRoomId}?theme=${theme.palette.mode}&header=false`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Agent Chat Room Preview"
          />
        )}
      </Box>
      {/* Dialogs */}
      <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={() => setDeleteDialog(false)}
        confirmDelete={handleDelete}
        title="Delete Agent"
        message="Are you sure you want to delete the agent?"
      />
      {!currentAgent?.cloned_template_id && (
        <TemplateDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          mode="agent"
          templateSelector={templateSelector}
          versionsSelector={versionsSelector}
        />
      )}
      {currentAgent && (
        <ShareAgentDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          agent={currentAgent}
        />
      )}
    </Box>
  );
}

Agent.propTypes = {
  agentId: PropTypes.string,
  id: PropTypes.string,
  altanerComponentId: PropTypes.string,
  onGoBack: PropTypes.func.isRequired,
};

// Require either agentId or id to be provided
Agent.defaultProps = {
  agentId: null,
  id: null,
};

export default memo(Agent);
