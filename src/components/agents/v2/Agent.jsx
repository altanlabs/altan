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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

// hooks
import { useAuthContext } from '../../../auth/useAuthContext';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
// sdk
import { Room } from '../../../lib/agents/components';
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
  const [anchorEl, setAnchorEl] = useState(null);

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
    const url = `/agent/${agentData?.id}/share`;
    window.open(url, '_blank');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
                <TextField
                  variant="standard"
                  value={agentData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Agent description"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: isMobile ? '0.875rem' : '0.875rem',
                      color: theme.palette.text.secondary,
                      '&:before, &:after': {
                        display: 'none',
                      },
                      '& input': {
                        padding: isMobile ? '8px 4px' : '4px 0px',
                        fontSize: isMobile ? '0.875rem' : '0.875rem',
                        color: theme.palette.text.secondary,
                        borderBottom: '1px solid transparent',
                        marginTop: '4px',
                        '&:focus': {
                          borderBottomColor: theme.palette.primary.main,
                          color: theme.palette.text.primary,
                        },
                        '&::placeholder': {
                          color: theme.palette.text.disabled,
                          opacity: 0.7,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Test Agent Button - Always visible */}

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

      {/* New Widget Preview - Always Visible on All Tabs */}
      {agentData?.id && agentData?.account_id && (
        <Room
          key={`widget-preview-${agentData.id}-${activeTab}-${JSON.stringify(agentData.widget || {})}`}
          mode="compact"
          accountId={agentData.account_id}
          agentId={agentData.id}
          placeholder={agentData.widget?.placeholder || 'How can I help you?'}
          guestInfo={{
            external_id: user?.id?.toString() || 'preview-user',
            first_name: user?.first_name || 'Preview',
            last_name: user?.last_name || 'User',
            email: user?.email || 'preview@example.com',
          }}
          // Use actual widget configuration from database
          tabs={agentData.widget?.tabs ?? true}
          conversation_history={agentData.widget?.conversation_history ?? true}
          members={agentData.widget?.members ?? true}
          settings={agentData.widget?.settings ?? true}
          theme={agentData.widget?.theme || undefined}
          title={agentData.widget?.title || undefined}
          description={agentData.widget?.description || undefined}
          voice_enabled={agentData.widget?.voice_enabled ?? true}
          suggestions={agentData.widget?.suggestions || undefined}
          primary_color={agentData.widget?.primary_color || '#007bff'}
          background_color={agentData.widget?.background_color || '#ffffff'}
          background_blur={agentData.widget?.background_blur ?? true}
          position={agentData.widget?.position || 'bottom-right'}
          widget_width={agentData.widget?.width || 350}
          room_width={agentData.widget?.room_width || 450}
          room_height={agentData.widget?.room_height || 600}
          border_radius={agentData.widget?.border_radius || 16}
          config={{
            debug: false,
          }}
          onError={(error) => {
            console.warn('Widget preview error:', error);
          }}
          onAuthSuccess={(guest) => {
            console.log('🎯 Widget Preview: Auth successful', guest);
          }}
          onConversationReady={(room) => {
            console.log('🎯 Widget Preview: Conversation ready', room);
          }}
        />
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
