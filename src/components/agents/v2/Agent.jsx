import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  TextField,
  Snackbar,
  Alert,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory, useParams } from 'react-router-dom';

// hooks
import { useAuthContext } from '../../../auth/useAuthContext';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// redux
import { fetchAgentRoom, updateAgent } from '../../../redux/slices/agents';
import { deleteAccountAgent, createTemplate } from '../../../redux/slices/general';
import { optimai_room, optimai } from '../../../utils/axios';
import RoomComponent from '../../room/Room';
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
import AgentInfoDialog from './components/AgentInfoDialog';
import AvatarSelectionModal from './components/AvatarSelectionModal';
import AgentTab from './tabs/AgentTab';
import ConversationsTab from './tabs/ConversationsTab';
import SecurityTab from './tabs/SecurityTab';
import ToolsTab from './tabs/ToolsTab';
import VoiceTab from './tabs/VoiceTab';
import WidgetTab from './tabs/WidgetTab';

const versionsSelector = (template) => template?.versions;

// Stable memoized component for test agent panel - prevents iframe reload on parent re-renders
const TestAgentIframe = memo(({ dmRoomId }) => {
  if (!dmRoomId) return null;
  
  return (
    <iframe
      key={`test-${dmRoomId}`}
      src={`/r/${dmRoomId}`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
      title="Test Agent"
      allow="microphone; camera; clipboard-write"
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if dmRoomId changes
  return prevProps.dmRoomId === nextProps.dmRoomId;
});

TestAgentIframe.displayName = 'TestAgentIframe';
TestAgentIframe.propTypes = {
  dmRoomId: PropTypes.string,
};

const TABS = [
  { id: 'agent', label: 'Agent', icon: 'eva:settings-2-outline', component: AgentTab },
  { id: 'tools', label: 'Tools', icon: 'eva:grid-outline', component: ToolsTab },
  { id: 'voice', label: 'Voice', icon: 'eva:mic-outline', component: VoiceTab },
  { id: 'security', label: 'Security', icon: 'eva:shield-outline', component: SecurityTab },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: 'eva:message-circle-outline',
    component: ConversationsTab,
  },
  {
    id: 'creator',
    label: 'Edit with AI',
    icon: 'eva:edit-2-outline',
    component: null, // We'll render this specially
  },
];

function Agent({ agentId, id, onGoBack, altanerComponentId }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { altanerId } = useParams();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const { currentAgent, isLoading, currentAgentDmRoomId } = useSelector((state) => state.agents);
  const { user } = useAuthContext();
  const templateSelector = useCallback(() => currentAgent?.template, [currentAgent]);
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get initial tab from URL params or default to 'creator'
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'creator';

  const [agentData, setAgentData] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showTestDrawer, setShowTestDrawer] = useState(true);
  const [creatorRoomId, setCreatorRoomId] = useState(null);
  const [dmRoomId, setDmRoomId] = useState(null);
  const [initialMessage, setInitialMessage] = useState(null);
  const chatPanelRef = useRef(null);
  const messageProcessedRef = useRef(false);

  // Handle tab change with URL update
  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);

      // Update URL with tab parameter
      const newSearchParams = new URLSearchParams(location.search);
      if (tabId === 'creator') {
        newSearchParams.delete('tab'); // Remove param for default tab
      } else {
        newSearchParams.set('tab', tabId);
      }

      const newSearch = newSearchParams.toString();
      const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      history.push(newPath, { replace: true });
    },
    [location.pathname, location.search, history],
  );

  useEffect(() => {
    if (agentId || id) {
      dispatch(fetchAgentRoom(agentId || id));
    }
  }, [dispatch, agentId, id]);

  useEffect(() => {
    if (currentAgent) {
      setAgentData(currentAgent);

      // Clear the old creator room ID when agent changes to prevent showing wrong room
      setCreatorRoomId(null);
      setDmRoomId(null);

      // Fetch the creator room for AI-assisted editing
      const fetchCreatorRoom = async () => {
        try {
          const creatorResponse = await optimai_room.get(
            `/external/agent_${currentAgent.id}?account_id=${currentAgent.account_id}&autocreate=true`,
          );
          const roomId = creatorResponse.data.room.id;
          setCreatorRoomId(roomId);

          // Check for message query param (only process once)
          if (!messageProcessedRef.current) {
            const searchParams = new URLSearchParams(location.search);
            const messageParam = searchParams.get('message');

            if (messageParam) {
              messageProcessedRef.current = true;

              // Store the message to be sent in the creator room
              setInitialMessage(decodeURIComponent(messageParam));

              // Clear the message param and ensure we're on the creator tab
              searchParams.delete('message');
              searchParams.delete('tab'); // Remove tab param to default to 'creator'
              const newSearch = searchParams.toString();
              history.replace({
                pathname: location.pathname,
                search: newSearch ? `?${newSearch}` : '',
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch creator room:', error);
        }
      };

      // Fetch the DM room for testing
      const fetchDmRoom = async () => {
        try {
          const dmResponse = await optimai.get(
            `/agent/${currentAgent.id}/dm?account_id=${currentAgent.account_id}`,
          );
          setDmRoomId(dmResponse.data.id);
        } catch (error) {
          console.error('Failed to fetch DM room:', error);
        }
      };

      fetchCreatorRoom();
      fetchDmRoom();
    }
  }, [currentAgent, location.search, history]);

  // Sync tab state with URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab') || 'creator';

    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [location.search, activeTab]);

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

  const handleTestAgent = () => {
    setShowTestDrawer(!showTestDrawer);
  };

  const handleTestAgentNewTab = () => {
    if (dmRoomId) {
      const url = `/room/${dmRoomId}`;
      window.open(url, '_blank');
    }
  };

  const handleCloseTestDrawer = useCallback(() => {
    setShowTestDrawer(false);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  console.log('creatorRoomId', creatorRoomId);

  const renderTabContent = () => {
    const activeTabConfig = TABS.find((tab) => tab.id === activeTab);

    // Special handling for creator tab
    if (activeTab === 'creator') {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {creatorRoomId && agentData ? (
              <iframe
                key={`${creatorRoomId}-${initialMessage ? 'with-message' : 'no-message'}`}
                src={`/r/${creatorRoomId}${(() => {
                  const params = new URLSearchParams();
                  // Add context about the agent being edited
                  params.set('context', `User is editing agent: ${agentData.name} (ID: ${agentData.id})`);
                  if (initialMessage) {
                    params.set('message', encodeURIComponent(initialMessage));
                  }
                  return `?${params.toString()}`;
                })()}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Creator Room"
                allow="microphone; camera; clipboard-write"
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography>Loading creator room...</Typography>
              </Box>
            )}
          </Box>
        </Box>
      );
    }

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
        py: 0.2,
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
          }}
        />

        {/* Main content */}
        <Box
          sx={{
            position: 'relative',
            textAlign: 'center',
            maxWidth: '560px',
            mx: 'auto',
            px: 3,
          }}
        >
          {/* Icon container */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              mb: 3,
            }}
          >
            <Iconify
              icon="mdi:robot-outline"
              sx={{
                fontSize: '2.5rem',
                color: 'primary.main',
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              color: 'text.primary',
            }}
          >
            Create Your First AI Agent
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              lineHeight: 1.7,
              fontSize: '0.9375rem',
            }}
          >
            Build intelligent AI agents that understand and assist your users 24/7. Configure tools,
            customize voice, and deploy in minutes.
          </Typography>

          {/* Create Agent Component */}
          <Box>
            <CreateAgent altanerComponentId={altanerComponentId} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!agentData) {
    return <AltanLogo />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PanelGroup
        direction="horizontal"
        className="w-full h-full"
      >
        {/* Main Agent Configuration Panel */}
        <Panel
          id="agent-config-panel"
          order={1}
          defaultSize={showTestDrawer ? 50 : 100}
          minSize={35}
          className="overflow-hidden flex flex-col"
        >
          {/* Header */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: theme.palette.divider,
              px: { xs: 1, sm: 2, md: 3 },
              py: 0.2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                {!altanerId && (
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
                )}

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
                    <TextField
                      variant="standard"
                      value={agentData.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Agent Name"
                      fullWidth
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: isMobile ? '1rem' : '1.25rem',
                          fontWeight: 'bold',
                          color: theme.palette.text.primary,
                          '&:before, &:after': {
                            display: 'none',
                          },
                          '& input': {
                            padding: isMobile ? '8px 4px' : '4px 0px',
                            fontSize: isMobile ? '1rem' : '1.25rem',
                            fontWeight: 'bold',
                            color: theme.palette.text.primary,
                            borderBottom: '2px solid transparent',
                            '&:focus': {
                              borderBottomColor: theme.palette.primary.main,
                            },
                            '&::placeholder': {
                              color: theme.palette.text.disabled,
                              opacity: 0.8,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* Desktop: Show all action buttons */}
                {!isMobile && (
                  <>
                    <Tooltip title="Delete Agent">
                      <IconButton
                        onClick={() => setDeleteDialog(true)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'error.dark' : 'error.lighter',
                          },
                        }}
                      >
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    </Tooltip>
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
                  </>
                )}

                {/* Mobile: Show popup menu for other actions */}
                {isMobile && (
                  <>
                    <Tooltip title="More actions">
                      <IconButton
                        onClick={handleMenuOpen}
                        sx={{ color: 'text.secondary' }}
                        size="small"
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          setInfoDialogOpen(true);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Iconify
                            icon="eva:info-outline"
                            sx={{ color: 'text.secondary' }}
                          />
                        </ListItemIcon>
                        <ListItemText>Agent Information</ListItemText>
                      </MenuItem>
                      {!currentAgent?.cloned_template_id && (
                        <MenuItem
                          onClick={() => {
                            handleVersionHistory();
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            <Iconify
                              icon="mdi:history"
                              sx={{ color: 'text.secondary' }}
                            />
                          </ListItemIcon>
                          <ListItemText>Version History</ListItemText>
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={() => {
                          setDeleteDialog(true);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Iconify
                            icon="eva:trash-2-outline"
                            sx={{ color: 'error.main' }}
                          />
                        </ListItemIcon>
                        <ListItemText sx={{ color: 'error.main' }}>Delete Agent</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}

                {/* Test Agent Button - Only show when drawer is closed */}
                {!showTestDrawer && (
                  <>
                    <Tooltip title="Test in new tab">
                      <IconButton
                        onClick={handleTestAgentNewTab}
                        size="small"
                        sx={{ color: 'text.secondary', mr: 0.5 }}
                      >
                        <Iconify icon="eva:external-link-outline" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      onClick={handleTestAgent}
                      variant="soft"
                      color="inherit"
                      size={isMobile ? 'small' : 'medium'}
                      startIcon={<Iconify icon="eva:play-circle-outline" />}
                      sx={{
                        minWidth: 'auto',
                        px: isMobile ? 1 : 2,
                      }}
                    >
                      {isMobile ? 'Test' : 'Test Agent'}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Tab Navigation */}
          {renderTabNavigation()}

          {/* Main Content Area - Responsive */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              overflow: 'auto',
              px: activeTab === 'creator' ? 0 : isMobile ? 1 : { xs: 1, sm: 2, md: 4 },
              py: activeTab === 'creator' ? 0 : isMobile ? 0.5 : 1,
              minHeight: 0, // Important for proper flex sizing
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: activeTab === 'creator' ? '100%' : isMobile ? '100%' : '800px',
                overflow: 'auto',
                minHeight: 0, // Important for proper flex sizing
              }}
            >
              {renderTabContent()}
            </Box>
          </Box>
        </Panel>

        {/* Resize Handle - only show when test drawer is open */}
        {showTestDrawer && !isMobile && (
          <PanelResizeHandle className="relative w-0.5 group cursor-ew-resize">
            <div className="absolute inset-y-0 left-0 right-0 bg-transparent group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:via-purple-500 group-hover:to-transparent transition-all duration-300 group-active:via-purple-600" />
            <div className="absolute inset-y-[20%] left-0 right-0 bg-transparent group-hover:shadow-[0_0_6px_rgba(168,85,247,0.3)] transition-shadow duration-300" />
          </PanelResizeHandle>
        )}

        {/* Test Chat Panel - Iframe - Always mounted to prevent reload */}
        {!isMobile && (
          <Panel
            ref={chatPanelRef}
            id="test-chat-panel"
            order={2}
            defaultSize={showTestDrawer ? 50 : 0}
            minSize={showTestDrawer ? 25 : 0}
            maxSize={showTestDrawer ? 60 : 0}
            collapsible={false}
            className="overflow-hidden"
          >
            <div style={{ height: '100%', display: showTestDrawer ? 'flex' : 'none', flexDirection: 'column' }}>
              <Box
                sx={{
                  height: '100%',
                  position: 'relative',
                  borderLeft: 1,
                  borderColor: theme.palette.divider,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Test drawer header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: 1,
                    borderColor: theme.palette.divider,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify
                      icon="eva:message-circle-outline"
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="subtitle2">Test Agent</Typography>
                  </Box>
                  <Tooltip title="Close test panel">
                    <IconButton
                      size="small"
                      onClick={handleCloseTestDrawer}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Iconify icon="eva:close-outline" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <TestAgentIframe dmRoomId={dmRoomId} />
                </div>
              </Box>
            </div>
          </Panel>
        )}
      </PanelGroup>

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
      <AgentInfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        agentData={agentData}
        onFieldChange={handleFieldChange}
        onCopyToClipboard={handleCopyToClipboard}
      />

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
    </div>
  );
}

Agent.propTypes = {
  agentId: PropTypes.string,
  id: PropTypes.string,
  onGoBack: PropTypes.func.isRequired,
};

export default memo(Agent);
