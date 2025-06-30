import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect, memo } from 'react';

import { CompactLayout } from '../../layouts/dashboard';
import { optimai_shop } from '../../utils/axios';

function ReferralsPage() {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await optimai_shop.get('/referral/stats');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateCode = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      await optimai_shop.post('/referral/create', null, {
        params: {
          code: code,
        },
      });
      setCode('');
      fetchStats(); // Refresh stats after creating
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create code');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        p={4}
      >
        <CircularProgress />
      </Box>
    );
  }

  const hasReferralCode = stats && stats.referral_stats !== null;

  return (
    <CompactLayout>
      <Container>
        <Box
          textAlign="center"
          mt={10}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
          >
            Referral Program
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Share Altan with your friends and colleagues. When they sign up using your referral
            code, both of you will receive special benefits!
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {hasReferralCode ? (
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2 }}
          >
            <Typography
              variant="h5"
              gutterBottom
            >
              Your Referral Dashboard
            </Typography>
            <Box sx={{ '& > *': { mb: 2 } }}>
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  p: 3,
                  borderRadius: 1,
                  mb: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="primary.contrastText"
                  gutterBottom
                >
                  Your Unique Referral Code
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: 'primary.contrastText',
                  }}
                >
                  {stats?.referral_stats?.code || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  <Typography variant="h6">{stats?.referral_stats?.times_redeemed || 0}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Successful Referrals
                  </Typography>
                </Paper>
                <Paper
                  elevation={1}
                  sx={{ p: 2, textAlign: 'center' }}
                >
                  <Typography
                    variant="h6"
                    color={stats?.referral_stats?.valid ? 'success.main' : 'error.main'}
                  >
                    {stats?.referral_stats?.valid ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Status
                  </Typography>
                </Paper>
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3 }}
            >
              Share your code with others to help them get started with Altan. Each successful
              referral brings rewards for both you and your referral!
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2 }}
          >
            <Typography
              variant="h5"
              gutterBottom
            >
              Create Your Referral Code
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Start sharing Altan with others by creating your unique referral code. Make it
              memorable and easy to share!
            </Typography>
            <Box sx={{ '& > *': { mb: 2 } }}>
              <TextField
                fullWidth
                id="code"
                label="Enter your desired referral code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., FRIEND20"
                inputProps={{
                  pattern: '^[a-zA-Z0-9_-]+$',
                  minLength: 3,
                  maxLength: 20,
                }}
                helperText="Code must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens."
              />
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCreateCode}
                disabled={isCreating || !code.match(/^[a-zA-Z0-9_-]+$/)}
                sx={{ mt: 2 }}
              >
                {isCreating ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress
                      size={20}
                      color="inherit"
                    />
                    <span>Creating...</span>
                  </Box>
                ) : (
                  'Create Referral Code'
                )}
              </Button>
              {createError && (
                <Alert
                  severity="error"
                  sx={{ mt: 2 }}
                >
                  Error: {createError}
                </Alert>
              )}
            </Box>
          </Paper>
        )}
      </Container>
    </CompactLayout>
  );
}

export default memo(ReferralsPage);
