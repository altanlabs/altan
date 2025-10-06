import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import ShareIcon from '@mui/icons-material/Share';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, memo } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

import { useAuthContext } from '../../auth/useAuthContext';
import Iconify from '../../components/iconify';
import { CompactLayout } from '../../layouts/dashboard';
import { analytics } from '../../lib/analytics';

// ----------------------------------------------------------------------

function ReferralsPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const referralUrl = user?.id ? `https://altan.ai?ref=${user.id}` : '';

  // Mock data - replace with actual API calls
  const earnedCredits = 0;
  const referralsMade = 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setShowConfetti(true);

      // Track referral link copied event
      analytics.track('referral_link_copied', {
        user_id: user?.id,
        referral_url: referralUrl,
      });

      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Altan AI',
          text: 'Check out Altan AI - Build AI agents and workflows!',
          url: referralUrl,
        });

        // Track referral link shared event
        analytics.track('referral_link_shared', {
          user_id: user?.id,
          referral_url: referralUrl,
          method: 'native_share',
        });
      } catch (err) {
        // Only log if user didn't cancel the share
        if (err.name !== 'AbortError') {
          console.error('Failed to share: ', err);
        }
      }
    }
  };

  return (
    <CompactLayout title="Referrals · Altan">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <Container
        maxWidth="lg"
        sx={{ pt: 3, pb: 6 }}
      >
        {/* Header */}
        <Stack
          spacing={0.5}
          sx={{ mb: 4, textAlign: 'center' }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}
          >
            Referrals
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Share and earn credits
          </Typography>
        </Stack>

        {/* Stats Cards */}
        <Grid
          container
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Grid
            item
            xs={12}
            md={6}
          >
            <Card
              sx={{
                p: 2.5,
                height: '100%',
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Iconify
                    icon="mdi:gift"
                    width={22}
                    sx={{ color: 'text.secondary' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, mb: 0.25 }}
                  >
                    ${earnedCredits}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Earned from referrals
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
          >
            <Card
              sx={{
                p: 2.5,
                height: '100%',
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Iconify
                    icon="mdi:account-multiple"
                    width={22}
                    sx={{ color: 'text.secondary' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, mb: 0.25 }}
                  >
                    {referralsMade}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    People you've referred
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
        >
          {/* Share & Earn Section */}
          <Grid
            item
            xs={12}
            lg={6}
          >
            <Card sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Share your link
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Earn credits for each successful referral
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  value={referralUrl}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleCopy}
                          edge="end"
                          size="small"
                          color={copied ? 'success' : 'default'}
                        >
                          {copied ? <DoneIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />

                <Stack
                  direction="row"
                  spacing={1.5}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopy}
                  >
                    Copy Link
                  </Button>
                  {navigator.share && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                    >
                      Share
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* Claim Rewards Section */}
          <Grid
            item
            xs={12}
            lg={6}
          >
            <Card sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Claim rewards
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Enter a referral link or user ID
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Paste link or user ID..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Claim Referral
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* How it Works Section */}
        <Card
          sx={{
            mt: 3,
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}
          >
            How it works
          </Typography>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              md={4}
            >
              <Stack
                spacing={1.5}
                alignItems="center"
                textAlign="center"
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Typography variant="h6">1</Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  Share your link
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Copy and share your unique referral link
                </Typography>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
            >
              <Stack
                spacing={1.5}
                alignItems="center"
                textAlign="center"
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Typography variant="h6">2</Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  Friend signs up
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  They get extra $2.5 credits as a bonus
                </Typography>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
            >
              <Stack
                spacing={1.5}
                alignItems="center"
                textAlign="center"
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Typography variant="h6">3</Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  You earn credits
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Get $2.5 when they publish their first website
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </CompactLayout>
  );
}

export default memo(ReferralsPage);
