/* eslint-disable react/display-name */
/* eslint-disable no-console */
import { LoadingButton } from '@mui/lab';
import { Stack, Typography, IconButton, Tooltip, Paper, Box, Button } from '@mui/material';
import { useState, useEffect, memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import ShareAgentDialog from './ShareAgentDialog.jsx';
import Iconify from '../../components/iconify';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import DeleteDialog from '../../pages/dashboard/superadmin/tables/DeleteDialog.jsx';
import { createTemplate, deleteAccountAgent } from '../../redux/slices/general';
import useAgentAttributes from '../../sections/@dashboard/agents/useAgentAttributes.jsx';
import { DynamicIsland } from '../dynamic-island/DynamicIsland.jsx';
import AltanLogo from '../loaders/AltanLogo.jsx';
import TemplateDialog from '../templates/TemplateDialog.jsx';

const versionsSelector = (template) => template?.versions?.items;

const EditAgentContent = memo(({ agent, variant = 'default' }) => {
  const navigate = useNavigate();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  // const [fetchedRoomId, setFetchedRoomId] = useState(null);
  // const [isLoadingRoom, setIsLoadingRoom] = useState(false);

  // const accountId = useSelector(selectAccountId);
  // const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [dispatchWithFeedback, dispatchSubmitting] = useFeedbackDispatch();

  const { triggerSubmit, isSubmitting, AgentAttributes } = useAgentAttributes({
    mode: 'update',
    agent,
  });

  // useEffect(() => {
  //   const fetchRoom = async () => {
  //     try {
  //       setIsLoadingRoom(true);
  //       const response = await optimai.get(`/agent/${agent.id}/dm?account_id=${accountId}`);
  //       console.log('response', response);
  //       setFetchedRoomId(response.data.id);
  //     } catch (error) {
  //       console.error('Error creating or fetching a chat room:', error);
  //     } finally {
  //       setIsLoadingRoom(false);
  //     }
  //   };

  //   if (isDesktop && agent?.id) {
  //     fetchRoom();
  //   }
  // }, [agent?.id, isDesktop]);

  const handleDelete = () => {
    dispatchWithFeedback(deleteAccountAgent(agent.id), {
      successMessage: 'Agent deleted successfully',
      errorMessage: 'Unexpected error: ',
      useSnackbar: true,
    }).then(() => navigate('/agents'));
  };

  const handleTemplate = useCallback(() => {
    if (!!agent.cloned_template_id) {
      console.log('agent cloned');
      return;
    }
    if (!!agent.template) {
      setTemplateDialogOpen(true);
    } else {
      const data = {
        id: agent.id,
        entity_type: 'agent',
      };
      dispatchWithFeedback(createTemplate(data), {
        successMessage: 'Agent template created successfully',
        errorMessage: 'There was an error creating agent template',
      });
    }
  }, [agent.cloned_template_id, agent.id, agent.template, dispatchWithFeedback]);

  const templateSelector = useCallback(() => agent.template, [agent.template]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          gap: 2,
        }}
      >
        <Box
          sx={{
            flex: {
              xs: '1 1 100%',
              md: '1 1 75%',
            },
            overflowY: 'auto',
            height: '100%',
          }}
        >
          {AgentAttributes}
          {variant === 'default' && (
            <DynamicIsland>
              <Stack
                minWidth={200}
                spacing={1}
                direction="row"
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

                {!agent.cloned_template_id && (
                  <Tooltip
                    arrow
                    followCursor
                    title={!agent.template ? 'Create template from agent' : 'View agent versions'}
                  >
                    <IconButton
                      loading={dispatchSubmitting}
                      id="marketplace"
                      variant="soft"
                      onClick={handleTemplate}
                    >
                      <Iconify icon="lucide:git-branch-plus" />
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
                  fullWidth
                  loading={isSubmitting}
                  onClick={triggerSubmit}
                  startIcon={<Iconify icon="mingcute:save-fill" />}
                  variant="contained"
                  color="primary"
                >
                  Save
                </LoadingButton>
              </Stack>
            </DynamicIsland>
          )}
          {variant === 'embedded' && (
            <Box
              sx={{
                position: 'sticky',
                bottom: 16,
                right: 16,
                zIndex: 1200,
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 1,
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                >
                  <LoadingButton
                    loading={isSubmitting}
                    onClick={triggerSubmit}
                    startIcon={<Iconify icon="mingcute:save-fill" />}
                    variant="contained"
                    color="primary"
                  >
                    Save Agent
                  </LoadingButton>
                </Stack>
              </Paper>
            </Box>
          )}
        </Box>

        {/* AltanerDrawer */}
        {/* {isDesktop && !isLoadingRoom && fetchedRoomId && (
          <Box
            sx={{
              flex: '1 1 25%',
              height: '100%',
              position: 'relative',
            }}
          >
            <AltanerDrawer
              roomId={fetchedRoomId}
              side="right"
            />
          </Box>
        )} */}
      </Box>
      {!agent.cloned_template_id && (
        <TemplateDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          mode="agent"
          templateSelector={templateSelector}
          versionsSelector={versionsSelector}
        />
      )}
      <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={() => setDeleteDialog(false)}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete the agent?"
      />
      <ShareAgentDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        agent={agent}
      />
    </>
  );
});

const selectAgents = (state) => state.general.account?.agents;

function EditAgent({ agent, agentId, variant = 'default' }) {
  const [currentAgent, setCurrentAgent] = useState(agent);
  const [isLoading, setIsLoading] = useState(!agent && !!agentId);
  const agents = useSelector(selectAgents);

  useEffect(() => {
    if (!agent && agentId) {
      setIsLoading(true);
      const foundAgent = agents?.find((a) => a.id.toString() === agentId.toString());
      if (foundAgent) {
        setCurrentAgent(foundAgent);
      }
      setIsLoading(false);
    }
  }, [agent, agentId, agents]);

  if (isLoading) {
    return <AltanLogo wrapped />;
  }

  if (!currentAgent) {
    return <Typography>404 Agent not found</Typography>;
  }

  return (
    <EditAgentContent
      agent={currentAgent}
      variant={variant}
    />
  );
}

export default memo(EditAgent);
