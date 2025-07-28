import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  TextField,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

// hooks
import { useAuthContext } from '../../../auth/useAuthContext';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// sdk
import { Room } from '../../../lib/agents';
// auth
// redux
import { fetchAgentDetails, updateAgent } from '../../../redux/slices/agents';
import { deleteAccountAgent, createTemplate } from '../../../redux/slices/general';
// sections
import CreateAgent from '../../../sections/@dashboard/agents/CreateAgent';
// utils
import { uploadMedia } from '../../../utils/media';
// components
import DeleteDialog from '../../dialogs/DeleteDialog';
import Iconify from '../../iconify';
import AltanLogo from '../../loaders/AltanLogo';
import ShareAgentDialog from '../../members/ShareAgentDialog';
import TemplateDialog from '../../templates/TemplateDialog';
import { UploadAvatar } from '../../upload';
// local components
import AvatarSelectionModal from './components/AvatarSelectionModal';
import AgentTab from './tabs/AgentTab';
import SecurityTab from './tabs/SecurityTab';
import VoiceTab from './tabs/VoiceTab';
import WidgetTab from './tabs/WidgetTab';

// Debounce utility to prevent excessive API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const versionsSelector = (template) => template?.versions;

const TABS = [
  { id: 'agent', label: 'Agent', icon: 'eva:settings-2-outline', component: AgentTab },
  { id: 'voice', label: 'Voice', icon: 'eva:mic-outline', component: VoiceTab },
  { id: 'security', label: 'Security', icon: 'eva:shield-outline', component: SecurityTab },
  { id: 'widget', label: 'Widget', icon: 'eva:cube-outline', component: WidgetTab },
];

function Agent({ agentId, id, onGoBack, altanerComponentId }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const { currentAgent, isLoading } = useSelector((state) => state.agents);
  const { user } = useAuthContext();
  const templateSelector = useCallback(() => currentAgent?.template, [currentAgent]);
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get initial tab from URL params or default to 'agent'
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'agent';

  const [agentData, setAgentData] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  // Handle tab change with URL update
  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);

      // Update URL with tab parameter
      const newSearchParams = new URLSearchParams(location.search);
      if (tabId === 'agent') {
        newSearchParams.delete('tab'); // Remove param for default tab
      } else {
        newSearchParams.set('tab', tabId);
      }

      const newSearch = newSearchParams.toString();
      const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      history.push(newPath, { replace: true });
    },
    [location.pathname, location.search, history.push],
  );

  useEffect(() => {
    if (agentId || id) {
      dispatch(fetchAgentDetails(agentId || id));
    }
  }, [dispatch, agentId, id]);

  useEffect(() => {
    if (currentAgent) {
      setAgentData(currentAgent);
    }
  }, [currentAgent]);

  // Sync tab state with URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab') || 'agent';

    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [location.search, activeTab]);

  const debouncedUpdateAgent = useCallback(
    debounce((id, data) => {
      dispatch(updateAgent(id, data));
    }, 500),
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

  const handleAvatarChange = (newAvatarSrc) => {
    handleFieldChange('avatar_url', newAvatarSrc);
  };

  const handleDropSingleFile = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          const mediaUrl = await uploadMedia(file);
          handleFieldChange('avatar_url', mediaUrl);
        } catch {}
      }
    },
    [handleFieldChange],
  );

  const handleDelete = () => {
    dispatchWithFeedback(deleteAccountAgent(currentAgent.id), {
      successMessage: 'Agent deleted successfully',
      errorMessage: 'Unexpected error: ',
      useSnackbar: true,
    }).then(() => {
      onGoBack();
    });
  };

  const handleGoBack = useCallback(async () => {
    onGoBack();
  }, [onGoBack]);

  const handleCopyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} copied to clipboard!`);
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleVersionHistory = async () => {
    // If agent doesn't have a template, create one first
    if (!currentAgent?.template) {
      try {
        await dispatchWithFeedback(
          createTemplate({
            id: currentAgent.id,
            entity_type: 'agent',
          }),
          {
            useSnackbar: true,
            successMessage: 'Agent template created successfully. Refreshing page...',
            errorMessage: 'Could not create agent template: ',
          },
        );
        // Refresh the page to update the agent data with the new template
        window.location.reload();
      } catch (error) {
        console.error('Failed to create template:', error);
      }
    } else {
      // Agent has a template, show the template dialog
      setTemplateDialogOpen(true);
    }
  };

  const handleTestAgent = useCallback(() => {
    setChatOpen(true);
  }, []);

  const renderTabContent = () => {
    const activeTabConfig = TABS.find((tab) => tab.id === activeTab);

    if (activeTabConfig?.component) {
      const TabComponent = activeTabConfig.component;
      return (
        <TabComponent
          key={agentData?.id}
          agentData={agentData}
          onFieldChange={handleFieldChange}
        />
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.palette.text.secondary,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{ fontSize: '4rem', mb: 2 }}
          >
            🚧
          </Typography>
          <Typography>This tab is coming soon!</Typography>
        </Box>
      </Box>
    );
  };

  const renderTabNavigation = () => (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 4,
        py: { xs: 0.5, sm: 0.75 },
      }}
    >
      {TABS.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          startIcon={
            <Iconify
              icon={tab.icon}
              color={activeTab === tab.id ? 'text.primary' : 'text.disabled'}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            />
          }
          sx={{
            minWidth: 0,
            py: { xs: 0.5, sm: 0.75 },
            px: { xs: 0.75, sm: 1 },
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
            fontWeight: 'medium',
            color: activeTab === tab.id ? 'text.primary' : 'text.secondary',
            bgcolor:
              activeTab === tab.id
                ? theme.palette.mode === 'dark'
                  ? 'grey.800'
                  : 'grey.100'
                : 'transparent',
            borderRadius: 1,
            mx: 0.125,
            '&:hover': {
              bgcolor:
                activeTab === tab.id
                  ? theme.palette.mode === 'dark'
                    ? 'grey.700'
                    : 'grey.200'
                  : theme.palette.mode === 'dark'
                    ? 'grey.800'
                    : 'grey.100',
              color: 'text.primary',
            },
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );

  if (altanerComponentId && !id) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Create Your First AI Agent</Typography>
        <CreateAgent altanerComponentId={altanerComponentId} />
      </Box>
    );
  }

  if (isLoading || !agentData) {
    return <AltanLogo />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: theme.palette.divider,
          px: { xs: 1, sm: 2, md: 3 },
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Tooltip title="Go Back">
              <IconButton
                onClick={handleGoBack}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                  },
                }}
              >
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <UploadAvatar
                sx={{ width: { xs: 48, sm: 56, md: 64 }, height: { xs: 48, sm: 56, md: 64 } }}
                file={agentData.avatar_url}
                onDrop={handleDropSingleFile}
                onDelete={() => handleFieldChange('avatar_url', null)}
                onEdit={() => setIsEditingAvatar(true)}
                editConfig={{
                  icon: 'ic:outline-change-circle',
                  tooltip: 'Choose another avatar',
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  style={{
                    fontSize: isMobile ? '1rem' : '1.25rem',
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    borderBottom: '2px solid transparent',
                    minWidth: 0,
                    width: '100%',
                  }}
                  value={agentData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Agent Name"
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = theme.palette.primary.main;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = 'transparent';
                  }}
                />
                <input
                  type="text"
                  style={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    color: theme.palette.text.secondary,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    borderBottom: '1px solid transparent',
                    marginTop: '4px',
                    minWidth: 0,
                    width: '100%',
                  }}
                  value={agentData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Agent description"
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = theme.palette.primary.main;
                    e.target.style.color = theme.palette.text.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = 'transparent';
                    e.target.style.color = theme.palette.text.secondary;
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <Tooltip title="Delete Agent">
              <IconButton
                onClick={() => setDeleteDialog(true)}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.lighter',
                  },
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Agent Information">
              <IconButton
                onClick={() => setInfoDialogOpen(true)}
                sx={{ color: 'text.secondary' }}
                size={isMobile ? 'small' : 'medium'}
              >
                <Iconify icon="eva:info-outline" />
              </IconButton>
            </Tooltip>
            {!currentAgent?.cloned_template_id && (
              <Tooltip title="Version History">
                <IconButton
                  onClick={handleVersionHistory}
                  sx={{ color: 'text.secondary' }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <Iconify icon="mdi:history" />
                </IconButton>
              </Tooltip>
            )}
            <Button
              onClick={handleTestAgent}
              variant="soft"
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              startIcon={
                <>
                  <Iconify icon="bxs:chat" sx={{ ml: 0.5 }} />
                </>
              }
              disabled={!agentData?.id}
            >
              Test
            </Button>
            {/* <Button
              onClick={() => setShareDialogOpen(true)}
              variant="soft"
              color="inherit"
              size={isMobile ? 'small' : 'medium'}
              startIcon={<Iconify icon="eva:share-fill" />}
            >
              {isMobile ? 'Share' : 'Share Agent'}
            </Button> */}
          </Box>
        </Box>
      </Box>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Main Content Area - Centered */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'auto',
          px: { xs: 1, sm: 2, md: 4 },
          py: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '800px',
            overflow: 'auto',
          }}
        >
          {renderTabContent()}
        </Box>
      </Box>

      {/* Chat Bubble */}
      {agentData?.id && agentData?.account_id && user?.id && (
        <>
          {/* Chat Button */}
          <Box
            onClick={() => setChatOpen(!chatOpen)}
            sx={{
              position: 'fixed',
              bottom: 25,
              right: 25,
              width: 50,
              height: 50,
              borderRadius: '25px',
              backgroundColor: '#000000',
              cursor: 'pointer',
              zIndex: 999999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            {chatOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="32" height="32">
                <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M36 35.6967C36 35.8403 35.8548 35.9385 35.7221 35.8837C34.828 35.5145 31.9134 34.3491 28.9961 33.5988H15.8234C14.2638 33.5988 13 32.4254 13 30.9786V15.6195C13 14.1735 14.2638 13 15.8234 13H33.1749C34.7346 13 35.9992 14.1735 35.9992 15.6195L36 35.6967Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M16.1336 21.2332C15.417 21.5924 15.0331 21.7849 15.0014 20.9346C14.9434 19.3815 16.7518 18.0688 19.0404 18.0026C21.3291 17.9364 23.2313 19.1418 23.2893 20.695C23.3234 21.6084 22.4804 21.3555 21.3147 21.0056C20.4984 20.7606 19.5238 20.4681 18.5812 20.4954C17.5455 20.5254 16.7259 20.9362 16.1336 21.2332Z" fill="#000000" />
                <path fillRule="evenodd" clipRule="evenodd" d="M32.56 21.2904C33.2766 21.6497 33.6605 21.8421 33.6922 20.9919C33.7502 19.4388 31.9418 18.126 29.6532 18.0599C27.3646 17.9937 25.4623 19.1991 25.4043 20.7522C25.3702 21.6657 26.2132 21.4127 27.3789 21.0629C28.1953 20.8179 29.1698 20.5254 30.1124 20.5526C31.1481 20.5826 31.9677 20.9935 32.56 21.2904Z" fill="#000000" />
              </svg>
            )}
          </Box>

          {/* Chat Window */}
          {chatOpen && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 100,
                right: 25,
                width: isMobile ? 'calc(100vw - 20px)' : '450px',
                height: isMobile ? 'calc(100vh - 120px)' : '700px',
                maxHeight: '800px',
                borderRadius: '16px',
                zIndex: 999999998,
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                animation: 'chatShow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                '@keyframes chatShow': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0.7) translateY(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1) translateY(0)',
                  },
                },
              }}
            >
              <Room
                mode="agent"
                accountId={agentData.account_id}
                agentId={agentData.id}
                guestInfo={{
                  external_id: user.id.toString(),
                  first_name: user.first_name || 'User',
                  last_name: user.last_name || '',
                  email: user.email || '',
                }}
                config={{
                  debug: true,
                }}
                style={{
                  borderRadius: '16px',
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={() => setDeleteDialog(false)}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete this agent? This action can't be undone."
      />
      {currentAgent && (
        <ShareAgentDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          agent={currentAgent}
        />
      )}

      <TemplateDialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        mode="agent"
        templateSelector={templateSelector}
        versionsSelector={versionsSelector}
      />
      <AvatarSelectionModal
        open={isEditingAvatar}
        onClose={() => setIsEditingAvatar(false)}
        setAvatar={handleAvatarChange}
      />

      {/* Agent Information Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Agent Information</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4 }}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Agent ID
              </Typography>
              <TextField
                fullWidth
                value={agentData?.id || ''}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton
                      onClick={() => handleCopyToClipboard(agentData?.id, 'Agent ID')}
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      <Iconify icon="eva:copy-outline" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                ElevenLabs Voice ID
              </Typography>
              <TextField
                fullWidth
                value={agentData?.elevenlabs_id || 'Not configured'}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                  endAdornment: agentData?.elevenlabs_id ? (
                    <IconButton
                      onClick={() =>
                        handleCopyToClipboard(agentData?.elevenlabs_id, 'ElevenLabs ID')}
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      <Iconify icon="eva:copy-outline" />
                    </IconButton>
                  ) : null,
                }}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={!!copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopySuccess('')}
          severity="success"
          variant="filled"
        >
          {copySuccess}
        </Alert>
      </Snackbar>
    </Box>
  );
}

Agent.propTypes = {
  agentId: PropTypes.string,
  id: PropTypes.string,
  onGoBack: PropTypes.func.isRequired,
};

export default memo(Agent);
