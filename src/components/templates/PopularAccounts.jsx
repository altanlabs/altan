import { Box, Skeleton, Typography, Button, Avatar, IconButton } from '@mui/material';
import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import { optimai } from '../../utils/axios';
import Iconify from '../iconify';

const PopularAccounts = memo(({ initialExpanded = false }) => {
  const history = useHistory();
  const { trackAccountViewed } = useAnalytics();
  const { user } = useAuthContext();

  // State management
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  // Scroll management
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleAccountClick = useCallback(
    (accountId) => {
      // Find the account data for analytics
      const account = accounts.find(acc => acc.id === accountId);

      // Track account view event
      if (account && user) {
        trackAccountViewed(accountId, account.name, {
          user_id: user.id,
          user_email: user.email,
          account_id: user.account_id,
          view_source: 'popular_accounts_carousel',
          viewed_account_type: account.type || 'unknown',
          template_count: account.template_count || 0,
          account_position: accounts.findIndex(acc => acc.id === accountId) + 1,
          total_accounts_shown: accounts.length,
        });
      }

      history.push(`/accounts/${accountId}`);
    },
    [history, trackAccountViewed, user, accounts],
  );

  // Scroll functionality
  const checkScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth',
      });
    }
  }, []);

  // Fetch popular accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await optimai.get(
        '/templates/accounts?limit=99&offset=0&template_type=altaner',
      );
      setAccounts(response.data.accounts || []);
    } catch (err) {
      console.error('Failed to fetch popular accounts:', err);
      setError('Failed to load popular accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollPosition, accounts.length]);

  // Account Card Component
  const AccountCard = memo(({ account, onClick }) => (
    <Box
      onClick={() => onClick(account.id)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'action.hover',
          transform: 'translateY(-2px)',
        },
        minWidth: 120,
        maxWidth: 120,
      }}
    >
      <Avatar
        src={account.logo_url}
        alt={account.name}
        sx={{
          width: 76,
          height: 76,
          mb: 1,
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        {account.name?.charAt(0)?.toUpperCase()}
      </Avatar>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          textAlign: 'center',
          mb: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {account.name}
      </Typography>

      {/* <Chip
        label={`${account.template_count} templates`}
        size="small"
        sx={{
          fontSize: '0.75rem',
          height: 20,
          backgroundColor: 'primary.light',
          color: 'primary.main',
        }}
      /> */}
    </Box>
  ));

  AccountCard.displayName = 'AccountCard';

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton
            variant="text"
            width={150}
            height={32}
          />
          <Skeleton
            variant="text"
            width={100}
            height={24}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{ minWidth: 120, flexShrink: 0 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Skeleton
                  variant="circular"
                  width={56}
                  height={56}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={20}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return null; // Silently fail for now
  }

  // Don't render if no accounts
  if (!loading && accounts.length === 0) {
    return null;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Popular Accounts
        </Typography>
        <Button
          size="small"
          onClick={handleToggleExpanded}
          endIcon={<Iconify icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      </Box>

      {isExpanded ? (
        // Grid view when expanded
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={handleAccountClick}
            />
          ))}
        </Box>
      ) : (
        // Horizontal scroll view with navigation arrows when collapsed
        <Box sx={{ position: 'relative' }}>
          {/* Left Arrow */}
          {canScrollLeft && (
            <IconButton
              onClick={scrollLeft}
              sx={{
                position: 'absolute',
                left: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                width: 40,
                height: 40,
              }}
            >
              <Iconify icon="mdi:chevron-left" />
            </IconButton>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <IconButton
              onClick={scrollRight}
              sx={{
                position: 'absolute',
                right: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                width: 40,
                height: 40,
              }}
            >
              <Iconify icon="mdi:chevron-right" />
            </IconButton>
          )}

          {/* Scrollable Container */}
          <Box
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 0,
              pb: 0,
              // Hide scrollbar completely
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
              '&::-webkit-scrollbar': {
                display: 'none', // Chrome, Safari, Opera
              },
            }}
          >
            {accounts.map((account) => (
              <Box
                key={account.id}
                sx={{
                  minWidth: 120,
                  maxWidth: 120,
                  flexShrink: 0,
                }}
              >
                <AccountCard
                  account={account}
                  onClick={handleAccountClick}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
});

PopularAccounts.displayName = 'PopularAccounts';

export default PopularAccounts;
