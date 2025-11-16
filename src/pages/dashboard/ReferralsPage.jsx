import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, memo } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

import { useAuthContext } from '../../auth/useAuthContext.ts';
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
  const [postLink, setPostLink] = useState('');

  const referralUrl = user?.id ? `https://altan.ai?ref=${user.id}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setShowConfetti(true);

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

  const handleSubmitPost = () => {
    if (!postLink.trim()) return;

    analytics.track('referral_post_submitted', {
      user_id: user?.id,
      post_link: postLink,
    });

    // TODO: Implement post submission logic
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Altan AI',
          text: 'Check out Altan AI - Build AI agents and workflows!',
          url: referralUrl,
        });

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
        sx={{ pt: 4, pb: 8 }}
      >
        {/* Header */}
        <Stack
          spacing={1}
          sx={{ mb: 5 }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 600 }}
          >
            Earn $250+ in Free Credits
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Share your work or invite friends to get more credits
          </Typography>
        </Stack>

        <Grid
          container
          spacing={3}
        >
          {/* Share what you're building Section */}
          <Grid
            item
            xs={12}
            lg={6}
          >
            <Card sx={{ p: 4, height: '100%', position: 'relative' }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Share what you&apos;re building
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Get up to $250 in credits based on post quality and engagement
                  </Typography>
                </Box>

                <Accordion
                  sx={{
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: 1,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: 48,
                      '&.Mui-expanded': { minHeight: 48 },
                      '& .MuiAccordionSummary-content': {
                        my: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      How to write a great post that earns max credits
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Start with impact:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Lead with a compelling one-liner about your idea and your hands-on
                          experience building it with Altan.
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Tell your story:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Share the &quot;why&quot; behind your project—your backstory, inspiration,
                          and who you built it for.
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Keep it authentic:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Write as yourself, not as AI. Genuine posts outperform marketing copy.
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Show, don&apos;t tell:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Include screenshots or video demos of your project.
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Boost your reach:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Tag @altanlabs on X or @altan-ai on LinkedIn for bonus credits.
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
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
                        icon="mdi:message-text-outline"
                        width={20}
                      />
                    </Box>
                    <Typography variant="body2">
                      Post about what you&apos;re building on social media
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <LinkIcon />
                    </Box>
                    <Typography variant="body2">Submit a link to your post</Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
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
                        icon="mdi:gift-outline"
                        width={20}
                      />
                    </Box>
                    <Typography variant="body2">
                      Get up to $250 in credits{' '}
                      <Box component="span" sx={{ color: 'text.secondary' }}>
                        (depending on account followers)
                      </Box>
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2 }}
                  >
                    Your post link:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="x.com/yourpost"
                    value={postLink}
                    onChange={(e) => setPostLink(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:twitter"
                      width={20}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:linkedin"
                      width={20}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:instagram"
                      width={20}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:facebook"
                      width={20}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:reddit"
                      width={20}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="ic:baseline-tiktok"
                      width={20}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:youtube"
                      width={20}
                    />
                  </IconButton>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmitPost}
                  disabled={!postLink.trim()}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
                    color: theme.palette.mode === 'dark' ? '#888' : '#666',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? '#666' : '#bbb',
                    },
                    '&:disabled': {
                      bgcolor: theme.palette.mode === 'dark' ? '#444' : '#ddd',
                      color: theme.palette.mode === 'dark' ? '#666' : '#999',
                    },
                  }}
                >
                  Submit post
                </Button>
              </Stack>
            </Card>
          </Grid>

          {/* Invite friends Section */}
          <Grid
            item
            xs={12}
            lg={6}
          >
            <Card sx={{ p: 4, height: '100%' }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Invite friends
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Share Altan with friends and both earn free credits
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <LinkIcon />
                    </Box>
                    <Typography variant="body2">Share your invite link</Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
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
                        icon="mdi:account-plus-outline"
                        width={20}
                      />
                    </Box>
                    <Typography variant="body2">They sign up</Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
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
                        icon="mdi:star-outline"
                        width={20}
                      />
                    </Box>
                    <Typography variant="body2">
                      Both get $10 in credits{' '}
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary' }}
                      >
                        once they upgrade to Pro
                      </Box>
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box>
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
                            {copied ? (
                              <DoneIcon fontSize="small" />
                            ) : (
                              <ContentCopyIcon fontSize="small" />
                            )}
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
                </Box>

                <Stack
                  direction="row"
                  spacing={1.5}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopy}
                  >
                    Copy link
                  </Button>
                  {navigator.share && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<Iconify icon="mdi:share-variant" />}
                      onClick={handleShare}
                    >
                      Share
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </CompactLayout>
  );
}

export default memo(ReferralsPage);
