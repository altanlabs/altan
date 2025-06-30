/* eslint-disable import/order */
// MUI imports
import { Typography, MenuItem, Tooltip } from '@mui/material';

// React and routing imports
import { memo, useCallback, useState } from 'react';
import { useHistory } from 'react-router';

// Internal components and hooks
import MenuPopover from '@components/menu-popover';

import ShareAgentDialog from './ShareAgentDialog.jsx';
import Iconify from '../../components/iconify';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import DeleteDialog from '../../pages/dashboard/superadmin/tables/DeleteDialog.jsx';
import { deleteAccountAgent } from '../../redux/slices/general';
import { optimai } from '../../utils/axios';
import {CustomAvatar} from '../custom-avatar';

const AgentCard = memo(({ agent, minified = false, tooltipText = null, onClick }) => {
  const history = useHistory();;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [openPopover, setOpenPopover] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);

  const handleClosePopover = useCallback(() => setOpenPopover(null), []);

  const navigateToMember = useCallback(() => {
    if (onClick) {
      onClick(agent.id);
    } else {
      // Get the current URL path segments
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments.includes('altaners')) {
        // We're in the altaners view, maintain the structure
        const altanerId = pathSegments[pathSegments.indexOf('altaners') + 1];
        const componentId = pathSegments[pathSegments.indexOf('c') + 1];
        history.push(`/altaners/${altanerId}/c/${componentId}/a/${agent.id}`);
      } else {
        // Default to the regular agent view
        history.push(`/agent/${agent.id}`);
      }
    }
    handleClosePopover();
  }, [agent.id, handleClosePopover, history, onClick]);

  const handleDelete = useCallback(() => {
    dispatchWithFeedback(deleteAccountAgent(agent.id), {
      successMessage: 'Agent deleted successfully',
      errorMessage: 'Unexpected error: ',
      useSnackbar: true,
    }).then(() => history.push('/agents'));
    setDeleteDialog(false);
    handleClosePopover();
  }, [agent.id, dispatchWithFeedback, handleClosePopover, history]);

  const handleChat = useCallback(async () => {
    try {
      const response = await optimai.get(`/agent/${agent.id}/dm`);
      const width = 500;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        `https://app.altan.ai/room/${response.data.id}`,
        'Chat with Agent',
        `width=${width},height=${height},left=${left},top=${top},popup=1,toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1`,
      );
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
    handleClosePopover();
  }, [agent.id, handleClosePopover]);

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    setOpenPopover(event.currentTarget);
  }, []);

  // Extract useful info for display
  const llmInfo = agent.llm_config?.provider
    ? `${agent.llm_config.provider} / ${agent.llm_config.model_id}`
    : 'Unknown model';

  return (
    <>
      {!minified ? (
        <div
          className="flex flex-col items-center text-center cursor-pointer p-2"
          onClick={navigateToMember}
          onContextMenu={handleContextMenu}
        >
          {/* Agent Avatar with Status Badge */}
          <div className="relative mb-2">
            <CustomAvatar
              src={agent.avatar_url}
              alt={agent.name}
              name={agent.name}
              sx={{
                width: 64,
                height: 64,
              }}
            />
          </div>

          {/* Agent Name */}
          <Typography
            variant="body1"
            className="font-semibold text-gray-900 dark:text-gray-100 mb-1"
          >
            {agent.name}
          </Typography>

          {/* Model Info */}
          {/* <div className="text-xs text-gray-600 dark:text-gray-400">{llmInfo}</div> */}
        </div>
      ) : (
        <Tooltip
          title={tooltipText ?? agent.name}
          arrow
          followCursor
        >
          <div className="relative">
            <CustomAvatar
              onClick={navigateToMember}
              onContextMenu={handleContextMenu}
              alt={agent.name}
              name={agent.name}
              src={agent.avatar_url}
              className="cursor-pointer w-[30px] h-[30px] hover:scale-110 transition-transform"
              sx={{
                border: '2px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  border: '2px solid rgba(59, 130, 246, 0.5)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                },
              }}
            />
          </div>
        </Tooltip>
      )}

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="bottom-center"
        sx={{ width: 200 }}
      >
        <MenuItem onClick={navigateToMember}>
          <Iconify icon="eva:edit-fill" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleChat}>
          <Iconify icon="bxs:chat" />
          Chat with agent
        </MenuItem>
        <MenuItem onClick={() => setShareDialog(true)}>
          <Iconify icon="mdi:share" />
          Share agent
        </MenuItem>
        <MenuItem
          onClick={() => setDeleteDialog(true)}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="mdi:trash" />
          Delete agent
        </MenuItem>
      </MenuPopover>

      <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={() => setDeleteDialog(false)}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete the agent?"
      />

      <ShareAgentDialog
        open={shareDialog}
        onClose={() => setShareDialog(false)}
        agent={agent}
      />
    </>
  );
});

AgentCard.displayName = 'AgentCard';

export default AgentCard;
