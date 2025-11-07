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
import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLocation, useHistory, useParams } from 'react-router-dom';

// hooks
import AgentInfoDialog from './components/AgentInfoDialog';
import AgentTab from './tabs/AgentTab';
import ConversationsTab from './tabs/ConversationsTab';
import McpTab from './tabs/McpTab';
import SecurityTab from './tabs/SecurityTab';
import ToolsTab from './tabs/ToolsTab';
import VoiceTab from './tabs/VoiceTab';
import { useAuthContext } from '../../../auth/useAuthContext';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// redux
import CreateAgentDashboard from '../../../pages/dashboard/components/CreateAgentDashboard';
import { fetchAgentRoom, updateAgent } from '../../../redux/slices/agents';
import { deleteAccountAgent, createTemplate } from '../../../redux/slices/general';
// sections
// components
import DynamicAgentAvatar from '../../agents/DynamicAgentAvatar';
import DeleteDialog from '../../dialogs/DeleteDialog';
import Iconify from '../../iconify';
import AltanLogo from '../../loaders/AltanLogo';
import ShareAgentDialog from '../../members/ShareAgentDialog';
import TemplateDialog from '../../templates/TemplateDialog';
import HybridTabs from '../../ui/hybrid-tabs';
// local components

const versionsSelector = (template) => template?.versions;

const TABS = [
  { id: 'agent', label: 'Agent', icon: 'eva:settings-2-outline', component: AgentTab },
  { id: 'tools', label: 'Tools', icon: 'eva:grid-outline', component: ToolsTab },
  { id: 'mcp', label: 'MCP', icon: 'mdi:server-network', component: McpTab },
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
  const { currentAgent, isLoading, currentAgentDmRoomId, currentAgentCreatorRoomId } = useSelector(
    (state) => state.agents,
  );
  const { user } = useAuthContext();
  const templateSelector = useCallback(() => currentAgent?.template, [currentAgent]);
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get initial tab from URL params
  // Default to 'agent' tab for existing agents
  // Default to 'creator' tab if there's a message param (coming from create flow)
  const searchParams = new URLSearchParams(location.search);
  const hasMessageParam = searchParams.has('message');
  const urlTab = searchParams.get('tab');
  const initialTab = urlTab || (hasMessageParam ? 'creator' : 'agent');

  const [agentData, setAgentData] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  // Default test drawer to closed when inside an altaner/project context
  const [showTestDrawer, setShowTestDrawer] = useState(!altanerComponentId);
  const [initialMessage, setInitialMessage] = useState(null);
  const chatPanelRef = useRef(null);
  const messageProcessedRef = useRef(false);

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

      // Check for message query param (only process once)
      if (!messageProcessedRef.current && currentAgentCreatorRoomId) {
        const searchParams = new URLSearchParams(location.search);
        const messageParam = searchParams.get('message');

        if (messageParam) {
          messageProcessedRef.current = true;

          // Store the message to be sent in the creator room
          setInitialMessage(decodeURIComponent(messageParam));

          // Clear the message param and explicitly set to creator tab
          searchParams.delete('message');
          searchParams.set('tab', 'creator'); // Explicitly set to creator tab
          const newSearch = searchParams.toString();
          history.replace({
            pathname: location.pathname,
            search: newSearch ? `?${newSearch}` : '',
          });
        }
      }
    }
  }, [currentAgent, currentAgentCreatorRoomId, location.search, history]);

  // Sync tab state with URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasMessage = searchParams.has('message');
    // If we have an initialMessage set, we should stay on creator tab even if URL param was cleared
    const shouldDefaultToCreator = hasMessage || (initialMessage && !searchParams.has('tab'));
    const urlTab = searchParams.get('tab') || (shouldDefaultToCreator ? 'creator' : 'agent');

    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [location.search, activeTab, initialMessage]);

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
    if (currentAgentDmRoomId) {
      const url = `/room/${currentAgentDmRoomId}`;
      window.open(url, '_blank');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderTabContent = () => {
    const activeTabConfig = TABS.find((tab) => tab.id === activeTab);

    // Special handling for creator tab
    if (activeTab === 'creator') {
      if (currentAgentCreatorRoomId && agentData) {
        return (
          <iframe
            key={`creator-${agentData.id}`}
            src={`/r/${currentAgentCreatorRoomId}${(() => {
              const params = new URLSearchParams();
              // Add context about the agent being edited
              params.set(
                'context',
                `User is editing agent: ${agentData.name} (ID: ${agentData.id})`,
              );
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
        );
      }

      if (!isLoading && !currentAgentCreatorRoomId) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              px: 3,
            }}
          >
            <Iconify
              icon="eva:alert-circle-outline"
              sx={{ fontSize: '3rem', color: 'text.secondary', opacity: 0.5 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
            >
              Creator Room Not Available
            </Typography>
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ textAlign: 'center', maxWidth: '400px' }}
            >
              This agent doesn't have a creator room configured. You can still edit the agent
              using the other tabs.
            </Typography>
          </Box>
        );
      }

      return (
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
      );
    }

    if (activeTabConfig?.component) {
      const TabComponent = activeTabConfig.component;
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          <TabComponent
            key={agentData?.id}
            agentData={agentData}
            onFieldChange={handleFieldChange}
          />
        </Box>
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
    <Box sx={{ width: '100%' }}>
      <HybridTabs
        items={TABS.map((tab) => ({
          value: tab.id,
          icon: (
            <Iconify
              icon={tab.icon}
              sx={{ fontSize: '0.95rem' }}
            />
          ),
          label: tab.label,
        }))}
        value={activeTab}
        onValueChange={handleTabChange}
      />
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
            <CreateAgentDashboard handleVoice={() => {}} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!agentData) {
    return <AltanLogo />;
  }

  const agentContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PanelGroup
        direction="horizontal"
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      >
        {/* Main Agent Configuration Panel */}
        <Panel
          id="agent-config-panel"
          order={1}
          defaultSize={showTestDrawer ? 70 : 100}
          minSize={35}
          style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Unified Header with Tabs */}
          <Box
            sx={{
              flexShrink: 0,
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1.5, sm: 1.25, md: 1 },
              backdropFilter: 'blur(10px)',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: isMobile ? 'flex' : 'grid',
              gridTemplateColumns: isMobile ? 'auto' : '1fr auto 1fr',
              flexDirection: isMobile ? 'column' : undefined,
              alignItems: 'center',
              gap: isMobile ? 1.5 : 2,
            }}
          >
            {/* Left: Avatar & Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 }, minWidth: 0 }}>
              {!altanerId && !isMobile && (
                <Tooltip title="Go Back">
                  <IconButton
                    size="small"
                    onClick={handleGoBack}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                      },
                    }}
                  >
                    <Iconify icon="eva:arrow-ios-back-fill" sx={{ fontSize: '1.25rem' }} />
                  </IconButton>
                </Tooltip>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1 }, minWidth: 0 }}>
                <DynamicAgentAvatar
                  agent={agentData}
                  size={isMobile ? 34 : 38}
                  agentId={agentData?.id}
                  agentState={null}
                  isStatic={false}
                />
                <Box sx={{ flex: 1, minWidth: 0, maxWidth: isMobile ? '120px' : '180px' }}>
                  <TextField
                    variant="standard"
                    value={agentData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Agent Name"
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: isMobile ? '0.8125rem' : '0.9375rem',
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                        '&:before, &:after': {
                          display: 'none',
                        },
                        '& input': {
                          padding: '1px 0px',
                          fontSize: isMobile ? '0.8125rem' : '0.9375rem',
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

            {/* Center: Tabs */}
            {!isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <HybridTabs
                  items={TABS.map((tab) => ({
                    value: tab.id,
                    icon: (
                      <Iconify
                        icon={tab.icon}
                        sx={{ fontSize: '1rem' }}
                      />
                    ),
                    label: tab.label,
                  }))}
                  value={activeTab}
                  onValueChange={handleTabChange}
                />
              </Box>
            )}

            {/* Mobile: Tabs full width */}
            {isMobile && renderTabNavigation()}

            {/* Right: Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
              {/* Test Agent Button - Only show when drawer is closed */}
              {!showTestDrawer && (
                <Button
                  onClick={handleTestAgent}
                  variant="soft"
                  color="inherit"
                  size="small"
                  startIcon={<Iconify icon="eva:play-circle-outline" sx={{ fontSize: '0.95rem' }} />}
                  sx={{
                    minWidth: 'auto',
                    px: isMobile ? 1 : 1.5,
                    py: 0.5,
                    fontSize: '0.8125rem',
                  }}
                >
                  {isMobile ? 'Test' : 'Test'}
                </Button>
              )}

              {/* More Options Menu */}
              <Tooltip title="More options">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon="eva:more-horizontal-fill" sx={{ fontSize: '1.2rem' }} />
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
                {showTestDrawer && (
                  <MenuItem onClick={handleTestAgentNewTab}>
                    <ListItemIcon>
                      <Iconify icon="eva:external-link-outline" sx={{ color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText>Open in New Tab</ListItemText>
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setShareDialogOpen(true);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Iconify icon="eva:share-outline" sx={{ color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText>Share</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setInfoDialogOpen(true);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Iconify icon="eva:info-outline" sx={{ color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText>Agent Info</ListItemText>
                </MenuItem>
                {!currentAgent?.cloned_template_id && (
                  <MenuItem
                    onClick={() => {
                      handleVersionHistory();
                      handleMenuClose();
                    }}
                  >
                    <ListItemIcon>
                      <Iconify icon="mdi:history" sx={{ color: 'text.secondary' }} />
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
                    <Iconify icon="eva:trash-2-outline" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText sx={{ color: 'error.main' }}>Delete Agent</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Main Content Area - Responsive */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              overflow: activeTab === 'creator' ? 'hidden' : 'auto',
              px: activeTab === 'creator' ? 0 : isMobile ? 1 : { xs: 1, sm: 2, md: 4 },
              py: activeTab === 'creator' ? 0 : isMobile ? 0.5 : 1,
              minHeight: 0, // Important for proper flex sizing
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: activeTab === 'creator' ? '100%' : isMobile ? '100%' : '800px',
                height: activeTab === 'creator' ? '100%' : 'auto',
                overflow: activeTab === 'creator' ? 'hidden' : 'auto',
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

        {/* Test Chat Panel - Iframe */}
        {showTestDrawer && !isMobile && (
          <Panel
            ref={chatPanelRef}
            id="test-chat-panel"
            order={2}
            defaultSize={30}
            minSize={25}
            maxSize={60}
            collapsible={false}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
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
                    onClick={() => setShowTestDrawer(false)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon="eva:close-outline" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {currentAgentDmRoomId && (
                  <iframe
                    key={`dm-${currentAgent.id}`}
                    src={`/r/${currentAgentDmRoomId}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title="Test Agent"
                    allow="microphone; camera; clipboard-write"
                  />
                )}
              </Box>
            </Box>
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
    </Box>
  );

  // Wrap in card-like container when rendered in altaner/project context
  if (altanerComponentId) {
    return (
      <Box className={`w-full h-full relative overflow-hidden ${isMobile ? '' : 'pb-2 px-2'}`}>
        <Box
          className={`flex flex-col h-full overflow-hidden ${
            isMobile ? '' : 'border border-divider rounded-xl'
          }`}
        >
          {agentContent}
        </Box>
      </Box>
    );
  }

  return agentContent;
}

Agent.propTypes = {
  agentId: PropTypes.string,
  id: PropTypes.string,
  onGoBack: PropTypes.func.isRequired,
  altanerComponentId: PropTypes.string,
};

export default memo(Agent);
