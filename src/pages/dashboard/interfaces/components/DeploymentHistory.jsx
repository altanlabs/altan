import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
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

const StyledListItem = styled(ListItem)(({ theme, status, isLive }) => ({
  borderLeft: `4px solid ${getStatusStyles(status).color}`,
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  backgroundColor: isLive ? theme.palette.action.selected : 'transparent',
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

  const VersionsList = () => {
    if (!ui?.deployments?.items) return null;

    const filteredDeployments = [...ui.deployments.items]
      .filter((deployment) => {
        const branchRef = deployment.meta_data?.deployment_info?.meta?.githubCommitRef;
        return branchRef !== 'dev';
      })
      .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

    return (
      <List>
        {filteredDeployments.map((deployment) => {
          const timeAgo = formatDistanceToNow(adjustDateForTimezone(deployment.date_creation), {
            addSuffix: true,
          });
          const commitMessage = deployment.meta_data?.message || 'No commit message';
          const isLive = deployment.id === liveDeploymentId;

          return (
            <StyledListItem
              key={deployment.id}
              status={deployment.status}
              isLive={isLive}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: 'inherit' }}>{commitMessage}</span>
                    {isLive && (
                      <Tooltip title="Current live version">
                        <Iconify
                          icon="mdi:radio-tower"
                          width={16}
                          sx={{ color: 'primary.main' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={timeAgo}
                primaryTypographyProps={{
                  style: {
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {deployment.meta_data?.deployment_info?.url && (
                  <Tooltip title="Preview deployment">
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(deployment.meta_data.deployment_info.url)}
                      color="inherit"
                    >
                      <Iconify
                        icon="mdi:eye"
                        width={20}
                      />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Restore this version">
                  <IconButton
                    size="small"
                    onClick={() => handleRestore(deployment.deployment_id)}
                    color="inherit"
                    disabled={isRestoring}
                  >
                    <Iconify
                      icon="mdi:restore"
                      width={20}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View logs">
                  <IconButton
                    size="small"
                    onClick={() => setSelectedDeploymentId(deployment.id)}
                    color="inherit"
                  >
                    <Iconify
                      icon="mdi:text-box-search"
                      width={20}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </StyledListItem>
          );
        })}
      </List>
    );
  };

  const CommitsList = () => {
    if (!ui?.commits?.items) return null;

    const currentCommitSha = ui?.meta_data?.current_commit?.sha;
    const sortedCommits = [...ui.commits.items].sort(
      (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
    );

    return (
      <List>
        {sortedCommits.map((commit) => {
          const isCurrentCommit = commit.commit_hash === currentCommitSha;
          return (
            <StyledListItem
              key={commit.commit_hash}
              status="default"
              isLive={isCurrentCommit}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{commit.message}</span>
                    {isCurrentCommit && (
                      <Tooltip title="Current commit">
                        <Iconify
                          icon="mdi:source-branch-check"
                          width={16}
                          sx={{ color: 'primary.main' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={formatDistanceToNow(adjustDateForTimezone(commit.date_creation), {
                  addSuffix: true,
                })}
                primaryTypographyProps={{
                  style: {
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Restore this version">
                  <IconButton
                    size="small"
                    onClick={() => handleRestore(commit.commit_hash, true)}
                    color="inherit"
                    disabled={isRestoring}
                  >
                    <Iconify
                      icon="mdi:restore"
                      width={20}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </StyledListItem>
          );
        })}
      </List>
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
                <Typography variant="body2">Versions</Typography>
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
