import { GitHub as GitHubIcon } from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Switch,
  Button,
  Tooltip,
  Link,
} from '@mui/material';
import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AddCollaboratorDialog from './AddCollaboratorDialog.jsx';
import AddDomainDialog from './AddDomainDialog.jsx';
import CommitDialog from './CommitDialog.jsx';
import EditMemoryDialog from './EditMemoryDialog.jsx';
import Iconify from '../../../../components/iconify/Iconify.jsx';
import { selectAccountId, selectIsAccountFree, updateInterfaceById } from '../../../../redux/slices/general';
import { dispatch, useSelector } from '../../../../redux/store.js';
import { optimai, optimai_room } from '../../../../utils/axios';

function SettingsDrawer({ open, onClose, onAddDomain, onAddCollaborator, ui }) {
  const accountId = useSelector(selectAccountId);
  const isAccountFree = useSelector(selectIsAccountFree);
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [isAddCollabDialogOpen, setIsAddCollabDialogOpen] = useState(false);
  const [isMemoryDialogOpen, setIsMemoryDialogOpen] = useState(false);
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await optimai_room.get(
          `/external/interface_${ui.id}?account_id=${accountId}`,
        );
        setRoom(response.data.room);
      } catch (error) {
        console.error('Failed to fetch room:', error);
        setRoom(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (ui?.id) {
      fetchRoom();
    }
  }, [ui?.id]);

  const handleAddDomain = () => {
    setIsDomainDialogOpen(true);
    if (onAddDomain) onAddDomain();
  };

  const handleAddCollaborator = () => {
    setIsAddCollabDialogOpen(true);
    if (onAddCollaborator) onAddCollaborator();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
          },
        }}
      >
        <Box
          sx={{
            width: 400,
            p: 3,
            height: '100%',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 4 }}
          >
            <Stack>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600 }}
              >
                Interface Settings
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace' }}
                >
                  {ui.id}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(ui.id);
                  }}
                  sx={{ p: 0 }}
                >
                  <Iconify
                    icon="mdi:content-copy"
                    width={12}
                  />
                </IconButton>
              </Stack>
            </Stack>

            <IconButton
              onClick={onClose}
              sx={{
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
                },
              }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>

          {/* Settings Sections */}
          <Stack spacing={4}>
            {/* General Settings */}

            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, fontSize: '0.875rem' }}
              >
                General
              </Typography>

              <Stack spacing={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 0.5 }}
                  >
                    Custom Domain
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Configure a custom domain for your interface
                  </Typography>

                  {ui?.meta_data?.domains && Object.entries(ui.meta_data.domains).length > 0 && (
                    <Stack
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      {Object.entries(ui.meta_data.domains).map(([domain]) => (
                        <Box
                          key={domain}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Link
                              href={`https://${domain}`}
                              target="_blank"
                              underline="hover"
                              sx={{
                                fontFamily: 'monospace',
                                color: 'inherit',
                                '&:hover': { color: 'primary.main' },
                              }}
                            >
                              {domain}
                            </Link>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                try {
                                  await optimai.delete(`/interfaces/${ui.id}/domains/${domain}`);
                                  // You might want to refresh the interface data here
                                } catch (error) {
                                  console.error('Failed to delete domain:', error);
                                }
                              }}
                            >
                              <Iconify icon="mdi:delete" />
                            </IconButton>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:web" />}
                    onClick={handleAddDomain}
                    fullWidth
                    sx={{
                      py: 1,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white'),
                    }}
                  >
                    Add Domain
                  </Button>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 2 }}
                      >
                        <GitHubIcon sx={{ fontSize: 20 }} />
                        <Typography variant="subtitle2">GitHub Repository</Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Repository:
                        </Typography>
                        <Link
                          href={`https://github.com/${ui.repo_owner}/${ui.repo_name}`}
                          target="_blank"
                          underline="hover"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            color: (theme) => theme.palette.primary.main,
                          }}
                        >
                          {ui.repo_owner}/{ui.repo_name}
                        </Link>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'warning.900/10' : 'warning.50',
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'warning.700' : 'warning.200',
                      }}
                    >
                      <Typography
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? 'warning.200' : 'warning.700',
                          fontSize: '0.875rem',
                        }}
                      >
                        This is a private repository. You won&apos;t be able to access it until you
                        add yourself as a collaborator.
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:account-plus" />}
                      onClick={handleAddCollaborator}
                      fullWidth
                      sx={{
                        py: 1,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white'),
                      }}
                    >
                      Add Collaborator
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Development Settings */}
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, fontSize: '0.875rem' }}
              >
                Development
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
                }}
              >
                <Stack spacing={2}>
                  {/* <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 0.5 }}
                      >
                        Developer Mode
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Enable development features and debugging tools
                      </Typography>
                    </Box>
                    <Switch
                      checked={ui.dev_mode}
                      onChange={async () => {
                        try {
                          await dispatch(updateInterfaceById(ui.id, { dev_mode: !ui.dev_mode }));
                        } catch (error) {
                          console.error('Failed to update dev mode:', error);
                        }
                      }}
                      sx={{ ml: 2 }}
                    />
                  </Stack> */}

                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2 }}
                  >
                    Quick actions
                  </Typography>
                  <Tooltip
                    title="Remove Altan branding from the interface"
                    arrow
                  >
                    <Button
                      variant="soft"
                      startIcon={<Iconify icon="mdi:eye-off" />}
                      fullWidth
                      sx={{
                        py: 1,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white'),
                        justifyContent: 'flex-start',
                        '& .MuiButton-startIcon': {
                          marginRight: 1,
                        },
                      }}
                      onClick={async () => {
                        if (isAccountFree) {
                          // Redirect to pricing for free accounts
                          navigate('/pricing');
                          return;
                        }

                        try {
                          // Remove both Altan script tags
                          const scriptTags = [
                            '<script src="https://dashboard.altan.ai/snippet.js"></script>',
                            '<script src="https://www.altan.ai/snippet.js"></script>',
                          ];

                          for (const scriptTag of scriptTags) {
                            await optimai.post(`/interfaces/dev/${ui.id}/files/search-replace`, {
                              query: scriptTag,
                              replacement: '',
                              file_patterns: ['index.html'],
                            });
                          }

                          console.log('Altan branding removed successfully');
                        } catch (error) {
                          console.error('Failed to remove Altan branding:', error);
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography sx={{ flexGrow: 1, textAlign: 'left' }}>
                          Remove Altan Branding
                        </Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'primary.900' : 'primary.100',
                            color: (theme) => theme.palette.mode === 'dark' ? 'primary.200' : 'primary.800',
                            borderRadius: 0.75,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            lineHeight: 1,
                          }}
                        >
                          Pro
                        </Box>
                      </Box>
                    </Button>
                  </Tooltip>

                  <Tooltip
                    title="Commit your changes to the dev branch with a custom message"
                    arrow
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:source-commit" />}
                      fullWidth
                      sx={{
                        py: 1,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white'),
                      }}
                      onClick={() => setIsCommitDialogOpen(true)}
                    >
                      Commit Changes
                    </Button>
                  </Tooltip>

                  <Tooltip
                    title="Reset your dev branch to exactly match the main branch. This will discard all changes in dev and make it identical to main."
                    arrow
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:source-branch-sync" />}
                      fullWidth
                      sx={{
                        py: 1,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white'),
                      }}
                      onClick={async () => {
                        try {
                          await optimai.get(`/interfaces/dev/${ui.id}/repo/restore-main`);
                        } catch (error) {
                          console.error('Failed to restore dev to main:', error);
                        }
                      }}
                    >
                      Restore Dev to Main
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </Box>

            {/* Knowledge Settings */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                >
                  AI Knowledge
                </Typography>
                <Tooltip
                  title="Structured knowledge and memory that the AI agent has gathered from previous interactions with this interface"
                  arrow
                >
                  <IconButton size="small">
                    <Iconify icon="mdi:information" />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:brain" />}
                  onClick={() => setIsMemoryDialogOpen(true)}
                  sx={{
                    py: 1,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'white'),
                  }}
                >
                  Edit Memory
                </Button>
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
                }}
              >
                {isLoading ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Loading...
                  </Typography>
                ) : room?.meta_data?.memory ? (
                  <>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        mb: 2,
                      }}
                    >
                      {JSON.stringify(room.meta_data.memory, null, 2)}
                    </Box>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No knowledge data available
                  </Typography>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      <AddDomainDialog
        open={isDomainDialogOpen}
        onClose={() => setIsDomainDialogOpen(false)}
        ui={ui}
      />
      <AddCollaboratorDialog
        open={isAddCollabDialogOpen}
        onClose={() => setIsAddCollabDialogOpen(false)}
        interfaceId={ui?.id}
        repoOwner={ui?.repo_owner}
        repoName={ui?.repo_name}
      />
      <EditMemoryDialog
        open={isMemoryDialogOpen}
        onClose={() => setIsMemoryDialogOpen(false)}
        roomId={room?.id}
      />
      <CommitDialog
        open={isCommitDialogOpen}
        onClose={(result) => {
          setIsCommitDialogOpen(false);
          if (result && result.commit_hash) {
            // Optional: Show success message or refresh data
            console.log('Commit successful:', result);
          }
        }}
        interfaceId={ui?.id}
      />
    </>
  );
}

export default memo(SettingsDrawer);
