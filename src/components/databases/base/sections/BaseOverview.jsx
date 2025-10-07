import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  LinearProgress,
  Paper,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  Code,
  Cpu,
  Database,
  FolderOpen,
  HardDrive,
  Key,
  Pause,
  Play,
  Server,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectBaseById } from '../../../../redux/slices/bases';

const COMPUTE_TIERS = [
  {
    id: 'nano',
    name: 'NANO',
    price: '$0.007',
    memory: 'Up to 0.5 GB memory',
    cpu: 'Shared CPU',
  },
  {
    id: 'micro',
    name: 'MICRO',
    price: '$0.01344',
    memory: '1 GB memory',
    cpu: '2-core ARM CPU',
  },
  {
    id: 'small',
    name: 'SMALL',
    price: '$0.0206',
    memory: '2 GB memory',
    cpu: '2-core ARM CPU',
    recommended: true,
  },
  {
    id: 'medium',
    name: 'MEDIUM',
    price: '$0.0822',
    memory: '4 GB memory',
    cpu: '2-core ARM CPU',
  },
  {
    id: 'large',
    name: 'LARGE',
    price: '$0.1517',
    memory: '8 GB memory',
    cpu: '2-core ARM CPU',
  },
  {
    id: 'xl',
    name: 'XL',
    price: '$0.2877',
    memory: '16 GB memory',
    cpu: '4-core ARM CPU',
  },
  {
    id: '2xl',
    name: '2XL',
    price: '$0.562',
    memory: '32 GB memory',
    cpu: '8-core ARM CPU',
  },
  {
    id: '4xl',
    name: '4XL',
    price: '$1.32',
    memory: '64 GB memory',
    cpu: '16-core ARM CPU',
  },
];

const PRODUCTS = [
  {
    id: 'database',
    name: 'Database',
    description: 'PostgreSQL database',
    icon: Database,
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management',
    icon: Users,
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'File storage',
    icon: FolderOpen,
  },
  {
    id: 'functions',
    name: 'Edge Functions',
    description: 'Serverless functions',
    icon: Code,
  },
  {
    id: 'secrets',
    name: 'Secrets',
    description: 'Environment variables',
    icon: Key,
  },
];

function BaseOverview({ baseId, onNavigate }) {
  const base = useSelector((state) => selectBaseById(state, baseId));
  const [expanded, setExpanded] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(12);
  const [memoryUsage, setMemoryUsage] = useState(45);
  const [currentTier, setCurrentTier] = useState('nano');
  const [anchorEl, setAnchorEl] = useState(null);

  // Detect if instance is stopped (tables failed to load, likely 503)
  const isPaused = !base?.tables;

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(5, Math.min(95, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage((prev) => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 8)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentTierData = COMPUTE_TIERS.find((t) => t.id === currentTier);
  const tableCount = base?.tables?.items?.length || 0;

  const handleToggleStatus = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleConfirmToggle = () => {
    setIsPaused(!isPaused);
    setAnchorEl(null);
  };

  const handleCancelToggle = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  const getProductStats = (productId) => {
    switch (productId) {
      case 'database':
        return `${tableCount} tables`;
      case 'users':
        return '0 users';
      case 'storage':
        return '0 files';
      case 'functions':
        return '0 functions';
      case 'secrets':
        return '0 secrets';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      {/* No Database Alert */}
      {!base && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          icon={<Database size={20} />}
        >
          <Typography
            variant="body2"
            fontWeight="600"
            gutterBottom
          >
            No Database Yet
          </Typography>
          <Typography variant="body2">
            Ask the AI in the chat to create and activate a database for you. This is a preview of what
            your database interface will look like.
          </Typography>
        </Alert>
      )}

      {/* Paused Database Alert */}
      {base && isPaused && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
        >
          <Typography
            variant="body2"
            fontWeight="600"
            gutterBottom
          >
            Database Instance is Paused
          </Typography>
          <Typography variant="body2">
            This database instance is currently stopped. Click the "Resume" button to start it.
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ mb: 4 }}
      >
        <Stack spacing={1}>
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Overview
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Monitor and configure compute resources for your database
          </Typography>
        </Stack>
        <Box
          onClick={base ? handleToggleStatus : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            cursor: base ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            opacity: base ? 1 : 0.5,
            '&:hover': base ? {
              bgcolor: 'action.hover',
              transform: 'scale(1.05)',
            } : {},
            '&:active': base ? {
              transform: 'scale(0.98)',
            } : {},
          }}
        >
          {isPaused ? (
            <Play
              size={16}
              style={{ color: 'rgb(255, 0, 0)' }}
            />
          ) : (
            <Box
              sx={{
                position: 'relative',
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'success.main',
                animation: base ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.5,
                  },
                },
                '&::before': base ? {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                } : {},
                '@keyframes ping': {
                  '75%, 100%': {
                    transform: 'scale(2)',
                    opacity: 0,
                  },
                },
              }}
            />
          )}
          <Typography
            variant="body2"
            color={isPaused ? 'error.main' : 'success.main'}
            fontWeight="600"
          >
            {isPaused ? 'Paused' : 'Active'}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        {/* Product Shortcuts */}
        <Box>
          <Grid
            container
            spacing={2}
          >
            {PRODUCTS.map((product) => {
              const Icon = product.icon;
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={product.id}
                >
                  <Card
                    sx={{
                      cursor: base ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      opacity: base ? 1 : 0.6,
                      '&:hover': base ? {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      } : {},
                    }}
                    onClick={() => base && onNavigate?.(product.id === 'database' ? 'tables' : product.id)}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={18} />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight="600"
                          >
                            {getProductStats(product.id)}
                          </Typography>
                        </Stack>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                          >
                            {product.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Compute Size Card */}
        <Card sx={{ opacity: base ? 1 : 0.6 }}>
          <CardContent>
            <Stack spacing={3}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Server size={20} />
                    <Typography
                      variant="h6"
                      fontWeight="600"
                    >
                      Compute Configuration
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Current: {currentTierData?.name} - {currentTierData?.memory},{' '}
                    {currentTierData?.cpu}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!base}
                  endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Hide' : 'View'} Plans
                </Button>
              </Stack>

              <Collapse in={expanded}>
                <Stack spacing={2}>
                  <Grid
                    container
                    spacing={2}
                  >
                    {COMPUTE_TIERS.map((tier) => {
                      const isSelected = tier.id === currentTier;
                      return (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          key={tier.id}
                        >
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              position: 'relative',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => setCurrentTier(tier.id)}
                          >
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                >
                                  <Chip
                                    label={tier.name}
                                    size="small"
                                    color={isSelected ? 'primary' : 'default'}
                                  />
                                  {tier.recommended && (
                                    <Chip
                                      label="Recommended"
                                      color="success"
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>
                                <Typography
                                  variant="h5"
                                  fontWeight="bold"
                                >
                                  {tier.price}
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {' '}
                                    / hour
                                  </Typography>
                                </Typography>
                                <Stack spacing={0.5}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <Cpu
                                      size={14}
                                      style={{ verticalAlign: 'middle', marginRight: 4 }}
                                    />
                                    {tier.cpu}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <HardDrive
                                      size={14}
                                      style={{ verticalAlign: 'middle', marginRight: 4 }}
                                    />
                                    {tier.memory}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Stack>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>

        {/* Infrastructure Activity - Only show when base exists */}
        {base && (
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ mb: 3 }}
              >
                Infrastructure Activity
              </Typography>

            <Grid
              container
              spacing={3}
            >
              {/* CPU Usage */}
              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Cpu size={18} />
                      <Typography
                        variant="body1"
                        fontWeight="600"
                      >
                        CPU Usage
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      color="primary"
                    >
                      {cpuUsage.toFixed(1)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={cpuUsage}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        bgcolor:
                          cpuUsage > 80
                            ? 'error.main'
                            : cpuUsage > 60
                              ? 'warning.main'
                              : 'success.main',
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Current load on {currentTierData?.cpu}
                  </Typography>
                </Stack>
              </Grid>

              {/* Memory Usage */}
              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <HardDrive size={18} />
                      <Typography
                        variant="body1"
                        fontWeight="600"
                      >
                        Memory Usage
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      color="primary"
                    >
                      {memoryUsage.toFixed(1)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={memoryUsage}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        bgcolor:
                          memoryUsage > 80
                            ? 'error.main'
                            : memoryUsage > 60
                              ? 'warning.main'
                              : 'info.main',
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Using{' '}
                    {((memoryUsage / 100) * parseFloat(currentTierData?.memory || 0.5)).toFixed(2)}{' '}
                    GB of {currentTierData?.memory}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        )}
      </Stack>

      {/* Confirmation Popover */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleCancelToggle}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 300,
            },
          },
        }}
      >
        <Paper sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                gutterBottom
              >
                {isPaused ? 'Resume Database?' : 'Pause Database?'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {isPaused ? (
                  <>
                    The database will be resumed and become available.
                  </>
                ) : (
                  <>
                    The database will be paused and unavailable.
                  </>
                )}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
            >
              <Button
                onClick={handleCancelToggle}
                variant="outlined"
                size="small"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmToggle}
                variant="contained"
                size="small"
                color={isPaused ? 'success' : 'error'}
                startIcon={isPaused ? <Play size={16} /> : <Pause size={16} />}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );
}

export default BaseOverview;
