import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Tooltip, Typography, useTheme, TextField, Snackbar, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

// hooks
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// redux
import { fetchAgentDetails, updateAgent } from '../../../redux/slices/agents';
import { deleteAccountAgent, createTemplate } from '../../../redux/slices/general';
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
import ChatPreview from './components/ChatPreview';
import VoicePreview from './components/VoicePreview';
import WidgetPreview from './components/WidgetPreview';
import AgentTab from './tabs/AgentTab';
import VoiceTab from './tabs/VoiceTab';
import WidgetTab from './tabs/WidgetTab';

// Tab Components

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
  // { id: 'analysis', label: 'Analysis', icon: 'eva:bar-chart-outline', component: null },
  // { id: 'security', label: 'Security', icon: 'eva:shield-outline', component: null },
  // { id: 'advanced', label: 'Advanced', icon: 'eva:code-outline', component: null },
  { id: 'widget', label: 'Widget', icon: 'eva:cube-outline', component: WidgetTab },
];

function Agent({ agentId, id, onGoBack }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const { currentAgent, currentAgentDmRoomId, isLoading } = useSelector((state) => state.agents);
  console.log('currentAgent', currentAgent);
  const templateSelector = useCallback(() => currentAgent?.template, [currentAgent]);

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

  // Set communication mode based on active tab
  const [communicationMode, setCommunicationMode] = useState(
    initialTab === 'voice' ? 'voice' : initialTab === 'widget' ? 'widget' : 'chat',
  );

  // Voice conversation is now handled by the VoiceConversation component

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

      // Set communication mode based on tab
      if (tabId === 'voice') {
        setCommunicationMode('voice');
      } else if (tabId === 'widget') {
        setCommunicationMode('widget');
      } else {
        setCommunicationMode('chat');
      }
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
      setCommunicationMode(urlTab === 'voice' ? 'voice' : urlTab === 'widget' ? 'widget' : 'chat');
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
    // Voice conversation cleanup is handled by the VoiceConversation component
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

  const renderCommunicationPanel = () => {
    return (
      <Box sx={{ height: '100%', bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
        {/* Communication Mode Toggle */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: theme.palette.divider,
            px: 2,
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify
                icon={
                  communicationMode === 'chat'
                    ? 'eva:message-circle-outline'
                    : communicationMode === 'voice'
                      ? 'eva:mic-outline'
                      : 'eva:cube-outline'
                }
                color={theme.palette.text.secondary}
              />
              <Typography
                variant="subtitle2"
                color="text.primary"
              >
                {communicationMode === 'chat'
                  ? 'Live Chat'
                  : communicationMode === 'voice'
                    ? 'Voice Chat'
                    : 'Widget Preview'}
              </Typography>
            </Box>

            {/* Mode Toggle */}
            <Box
              sx={{
                display: 'flex',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <Button
                onClick={() => setCommunicationMode('chat')}
                size="small"
                color="inherit"
                variant="soft"
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  color: communicationMode === 'chat' ? undefined : 'text.secondary',
                }}
              >
                Chat
              </Button>
              <Button
                color="inherit"
                onClick={() => setCommunicationMode('voice')}
                size="small"
                variant="soft"
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  color: communicationMode === 'voice' ? undefined : 'text.secondary',
                }}
              >
                Voice
              </Button>
              <Button
                color="inherit"
                onClick={() => setCommunicationMode('widget')}
                size="small"
                variant="soft"
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  color: communicationMode === 'widget' ? undefined : 'text.secondary',
                }}
              >
                Widget
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Render content based on mode */}
        <Box sx={{ height: 'calc(100% - 60px)' }}>
          {communicationMode === 'chat' ? (
            <ChatPreview currentAgentDmRoomId={currentAgentDmRoomId} />
          ) : communicationMode === 'voice' ? (
            <VoicePreview
              agentData={agentData}
              onConfigureVoice={() => handleTabChange('voice')}
            />
          ) : (
            <WidgetPreview
              agentData={agentData}
              onConfigureWidget={() => handleTabChange('widget')}
            />
          )}
        </Box>
      </Box>
    );
  };

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
          px: 3,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <UploadAvatar
                sx={{ width: 64, height: 64 }}
                file={agentData.avatar_url}
                onDrop={handleDropSingleFile}
                onDelete={() => handleFieldChange('avatar_url', null)}
                onEdit={() => setIsEditingAvatar(true)}
                editConfig={{
                  icon: 'ic:outline-change-circle',
                  tooltip: 'Choose another avatar',
                }}
              />
              <Box>
                <input
                  type="text"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    borderBottom: '2px solid transparent',
                    minWidth: 0,
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
                    fontSize: '0.875rem',
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Agent Information">
              <IconButton
                onClick={() => setInfoDialogOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                <Iconify icon="eva:info-outline" />
              </IconButton>
            </Tooltip>
            {!currentAgent?.cloned_template_id && (
              <Tooltip title="Version History">
                <IconButton
                  onClick={handleVersionHistory}
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="mdi:history" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Share Agent">
              <IconButton
                onClick={() => setShareDialogOpen(true)}
                sx={{ color: 'text.secondary' }}
              >
                <Iconify icon="eva:share-fill" />
              </IconButton>
            </Tooltip>
            <Button
              onClick={() => setDeleteDialog(true)}
              variant="contained"
              color="error"
              size="small"
              startIcon={<Iconify icon="eva:trash-2-outline" />}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel: Configuration */}
        <Box
          sx={{
            width: '60%',
            display: 'flex',
            borderRight: 1,
            borderColor: theme.palette.divider,
          }}
        >
          {/* Tab Navigation */}
          <Box
            sx={{
              width: 160,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              borderRight: 1,
              borderColor: theme.palette.divider,
            }}
          >
            <Box sx={{ p: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'block',
                }}
              >
                Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {TABS.map((tab) => (
                  <Button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    startIcon={
                      <Iconify
                        icon={tab.icon}
                        color={activeTab === tab.id ? 'text.primary' : 'text.disabled'}
                      />
                    }
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      py: 1,
                      px: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      color: activeTab === tab.id ? 'text.primary' : 'text.secondary',
                      bgcolor:
                        activeTab === tab.id
                          ? theme.palette.mode === 'dark'
                            ? 'grey.800'
                            : 'grey.100'
                          : 'transparent',
                      borderLeft: activeTab === tab.id ? 3 : 0,
                      borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
                      borderRadius: 1,
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
            </Box>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>{renderTabContent()}</Box>
        </Box>

        {/* Right Panel: Communication (Chat/Voice/Widget) */}
        <Box sx={{ width: '40%' }}>{renderCommunicationPanel()}</Box>
      </Box>

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
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                      onClick={() => handleCopyToClipboard(agentData?.elevenlabs_id, 'ElevenLabs ID')}
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
