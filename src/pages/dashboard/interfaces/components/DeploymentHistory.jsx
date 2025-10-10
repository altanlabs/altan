import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { styled } from '@mui/system';
import { formatDistanceToNow } from 'date-fns';
import React, { useState, useMemo, memo } from 'react';

import DeploymentLogsDialog from './DeploymentLogsDialog';
import Iconify from '../../../../components/iconify/Iconify';
import { optimai } from '../../../../utils/axios';

const getStatusStyles = (status) => {
  switch (status) {
    case 'PROMOTED':
      return { color: 'green', icon: 'mdi:check-circle' };
    case 'PENDING':
      return { color: 'orange', icon: 'mdi:clock-outline' };
    case 'QUEUED':
      return { color: 'blue', icon: 'mdi:progress-clock' };
    case 'ERROR':
      return { color: 'red', icon: 'mdi:alert-circle' };
    default:
      return { color: 'gray', icon: 'mdi:alert-circle-outline' };
  }
};

const StyledDeploymentCard = styled(Card)(({ theme, isLive, coverUrl }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  minHeight: 120,
  background: coverUrl
    ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url(${coverUrl})`
    : isLive
      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      : 'rgba(255,255,255,0.02)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backdropFilter: 'blur(10px)',
  border: isLive
    ? `2px solid ${theme.palette.primary.main}20`
    : `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    border: `1px solid ${theme.palette.primary.main}40`,
  },
  '&::before': isLive ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    zIndex: 1,
  } : {},
}));

function DeploymentHistory({ ui, handleReload }) {
  const [viewMode, setViewMode] = useState('versions');
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const liveDeploymentId = ui?.meta_data?.live_deployment;
  const interfaceId = ui?.id;

  // Get the timezone offset in hours (positive for timezones ahead of UTC)
  const timezoneOffsetHours = useMemo(() => {
    const offsetMinutes = new Date().getTimezoneOffset();
    return -(offsetMinutes / 60); // Negative because getTimezoneOffset returns opposite sign
  }, []);

  const adjustDateForTimezone = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + timezoneOffsetHours);
    return date;
  };

  const handlePreview = (url) => {
    window.open(`https://${url}`, '_blank');
  };

  const handleRestore = async (identifier, isCommit = false) => {
    try {
      setIsRestoring(true);
      if (isCommit) {
        await optimai.post(`/interfaces/dev/${interfaceId}/commits/${identifier}/restore`);
      } else {
        await optimai.post(`/interfaces/${interfaceId}/deployment/${identifier}/rollback`);
      }
    } catch (error) {
      console.error('Failed to restore:', error);
    } finally {
      setIsRestoring(false);
      handleReload();
    }
  };

  const handleCopyDeploymentId = async (deploymentId) => {
    try {
      await navigator.clipboard.writeText(deploymentId);
      // Could add a toast notification here if available
    } catch (error) {
      console.error('Failed to copy deployment ID:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = deploymentId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const VersionsList = () => {
    if (!ui?.deployments?.items) return null;

    const filteredDeployments = [...ui.deployments.items]
      .filter((deployment) => {
        const branchRef = deployment.meta_data?.deployment_info?.meta?.githubCommitRef;
        return branchRef !== 'dev';
      })
      .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {filteredDeployments.map((deployment) => {
          const timeAgo = formatDistanceToNow(adjustDateForTimezone(deployment.date_creation), {
            addSuffix: true,
          });
          const commitMessage = deployment.meta_data?.message || 'No commit message';
          const isLive = deployment.id === liveDeploymentId;
          const coverUrl = deployment.cover_url;
          const deploymentUrl = deployment.meta_data?.deployment_info?.url;
          const statusInfo = getStatusStyles(deployment.status);

          return (
            <StyledDeploymentCard
              key={deployment.id}
              status={deployment.status}
              isLive={isLive}
              coverUrl={coverUrl}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 2,
                  '&:last-child': { pb: 2.5 },
                  cursor: deploymentUrl ? 'pointer' : 'default',
                }}
                onClick={() => deploymentUrl && handlePreview(deploymentUrl)}
              >
                {/* Header */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: coverUrl ? 'white' : 'inherit',
                          textShadow: coverUrl ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                        }}
                      >
                        {commitMessage !== 'No commit message' ? commitMessage : 'Deployment'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.85rem',
                          color: coverUrl ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                          textShadow: coverUrl ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                        }}
                      >
                        {timeAgo}
                      </Typography>
                    </Box>

                    {/* Status and Live Indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      {isLive && (
                        <Chip
                          label="LIVE"
                          size="small"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 24,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                      <Tooltip title={deployment.status}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: coverUrl ? 'rgba(255,255,255,0.2)' : `${statusInfo.color}20`,
                            backdropFilter: coverUrl ? 'blur(10px)' : 'none',
                            border: coverUrl ? '1px solid rgba(255,255,255,0.3)' : 'none',
                          }}
                        >
                          <Iconify
                            icon={statusInfo.icon}
                            width={14}
                            sx={{ color: coverUrl ? 'white' : statusInfo.color }}
                          />
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                  {deployment.meta_data?.deployment_info?.url && !coverUrl && (
                    <Tooltip title="Preview deployment">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(deployment.meta_data.deployment_info.url);
                        }}
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'action.selected' },
                        }}
                      >
                        <Iconify icon="mdi:eye" width={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Copy deployment ID">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyDeploymentId(deployment.id);
                      }}
                      sx={{
                        bgcolor: coverUrl ? 'rgba(255,255,255,0.15)' : 'action.hover',
                        backdropFilter: coverUrl ? 'blur(10px)' : 'none',
                        border: coverUrl ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        color: coverUrl ? 'white' : 'inherit',
                        '&:hover': {
                          bgcolor: coverUrl ? 'rgba(255,255,255,0.25)' : 'action.selected',
                        },
                      }}
                    >
                      <Iconify icon="mdi:content-copy" width={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restore this version">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(deployment.deployment_id);
                      }}
                      disabled={isRestoring}
                      sx={{
                        bgcolor: coverUrl ? 'rgba(255,255,255,0.15)' : 'action.hover',
                        backdropFilter: coverUrl ? 'blur(10px)' : 'none',
                        border: coverUrl ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        color: coverUrl ? 'white' : 'inherit',
                        '&:hover': {
                          bgcolor: coverUrl ? 'rgba(255,255,255,0.25)' : 'action.selected',
                        },
                      }}
                    >
                      <Iconify icon="mdi:restore" width={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View logs">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeploymentId(deployment.id);
                      }}
                      sx={{
                        bgcolor: coverUrl ? 'rgba(255,255,255,0.15)' : 'action.hover',
                        backdropFilter: coverUrl ? 'blur(10px)' : 'none',
                        border: coverUrl ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        color: coverUrl ? 'white' : 'inherit',
                        '&:hover': {
                          bgcolor: coverUrl ? 'rgba(255,255,255,0.25)' : 'action.selected',
                        },
                      }}
                    >
                      <Iconify icon="mdi:text-box-search" width={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </StyledDeploymentCard>
          );
        })}
      </Box>
    );
  };

  const CommitsList = () => {
    if (!ui?.commits?.items) return null;

    const currentCommitSha = ui?.meta_data?.current_commit?.sha;
    const sortedCommits = [...ui.commits.items].sort(
      (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
    );

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sortedCommits.map((commit) => {
          const isCurrentCommit = commit.commit_hash === currentCommitSha;
          const timeAgo = formatDistanceToNow(adjustDateForTimezone(commit.date_creation), {
            addSuffix: true,
          });

          return (
            <StyledDeploymentCard
              key={commit.commit_hash}
              status="default"
              isLive={isCurrentCommit}
              coverUrl={null}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {commit.message}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.85rem',
                      }}
                    >
                      {timeAgo}
                    </Typography>
                  </Box>

                  {/* Current Commit Indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    {isCurrentCommit && (
                      <Chip
                        label="CURRENT"
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    )}
                    <Tooltip title="Git commit">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Iconify
                          icon="mdi:source-branch"
                          width={14}
                          sx={{ color: 'text.secondary' }}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Tooltip title="Restore this version">
                    <IconButton
                      size="small"
                      onClick={() => handleRestore(commit.commit_hash, true)}
                      disabled={isRestoring}
                      sx={{
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <Iconify icon="mdi:restore" width={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </StyledDeploymentCard>
          );
        })}
      </Box>
    );
  };

  if (!ui || !ui.deployments || !ui.commits) {
    return <Typography>No deployments or commits available.</Typography>;
  }

  return (
    <Box>
      <Stack spacing={1}>
        <Typography variant="h4">Interface History</Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(event, newValue) => {
            if (newValue !== null) {
              setViewMode(newValue);
            }
          }}
          size="small"
          fullWidth
        >
          <ToggleButton value="versions">
            <Tooltip title="Versions">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:package-variant"
                  width={20}
                />
                <Typography variant="body2">Deployments</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="commits">
            <Tooltip title="Commits">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify
                  icon="mdi:source-branch"
                  width={20}
                />
                <Typography variant="body2">Commits</Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {viewMode === 'versions' ? <VersionsList /> : <CommitsList />}

      <DeploymentLogsDialog
        open={Boolean(selectedDeploymentId)}
        onClose={() => setSelectedDeploymentId(null)}
        deploymentId={selectedDeploymentId}
      />
    </Box>
  );
}

export default memo(DeploymentHistory);
