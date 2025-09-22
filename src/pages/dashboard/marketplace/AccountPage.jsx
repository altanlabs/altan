import { Avatar, Box, Container, Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import TemplateCard from './components/card/TemplateCard';
import EmptyContent from '../../../components/empty-content';
import { CompactLayout } from '../../../layouts/dashboard';
import TemplateDetailsDialog from '../../../components/templates/TemplateDetailsDialog';
import {
  fetchAccountData,
  loadMoreAccountTemplates,
  selectAccountState,
  selectAccountLoading,
  selectAccountError,
} from '../../../redux/slices/accountTemplates';

const ITEMS_PER_PAGE = 25;

const AccountPage = () => {
  const { accountId } = useParams();
  const dispatch = useDispatch();
  const loadMoreRef = useRef(null);

  // Get data from Redux store
  const accountState = useSelector(selectAccountState(accountId));
  const loading = useSelector(selectAccountLoading(accountId));
  const error = useSelector(selectAccountError(accountId));
  
  const { templates, account, hasMore, initialized } = accountState;

  // Local UI state
  const [searchTerm] = useState('');
  const [sorting] = useState('newest');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Template dialog handlers
  const handleTemplateClick = useCallback((template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!initialized && !loading) {
      dispatch(fetchAccountData(accountId));
    }
  }, [dispatch, accountId, initialized, loading]);

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
          dispatch(loadMoreAccountTemplates(accountId));
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [dispatch, accountId, loading, hasMore]);

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort templates based on selected sorting
  const sortedTemplates = React.useMemo(() => {
    if (!filteredTemplates.length) return [];

    return [...filteredTemplates].sort((a, b) => {
      switch (sorting) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [filteredTemplates, sorting]);

  if (error) {
    return (
      <Container sx={{ py: 10 }}>
        <EmptyContent
          title={error}
          sx={{
            '& span.MuiBox-root': { height: 160 },
          }}
        />
      </Container>
    );
  }

  return (
    <CompactLayout>
      <Container sx={{ py: 4 }}>
        {/* Account Profile Header */}
        <Box sx={{ mb: 6 }}>
          {account ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Avatar */}
              <Avatar
                src={account.logo_url}
                alt={account.name}
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  border: 3,
                  borderColor: 'divider',
                }}
              >
                {/* Fallback to first letter if no image */}
                {account.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              {/* Profile Info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{ mb: 1 }}
                >
                  {account.name}
                </Typography>
                {account.description && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      maxWidth: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    {account.description}
                  </Typography>
                )}

                {/* Template count */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, fontWeight: 500 }}
                >
                  {templates.length > 0 &&
                    `${templates.length} template${templates.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            </Box>
          ) : (
            /* Loading skeleton for profile */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Skeleton
                variant="circular"
                width={{ xs: 80, sm: 100, md: 120 }}
                height={{ xs: 80, sm: 100, md: 120 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width={300}
                  height={48}
                />
                <Skeleton
                  variant="text"
                  width={500}
                  height={24}
                  sx={{ mt: 1 }}
                />
                <Skeleton
                  variant="text"
                  width={150}
                  height={20}
                  sx={{ mt: 2 }}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Templates Section */}
        <Box sx={{ mt: 4 }}>
          {/* Section Title */}
          {account && (
            <Typography
              variant="h5"
              gutterBottom
              sx={{ mb: 3 }}
            >
              Templates
            </Typography>
          )}

          {loading && !templates.length ? (
            <Grid
              container
              spacing={3}
            >
              {[...Array(6)].map((_, index) => (
                <Grid
                  key={index}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{ borderRadius: 2, pt: '150%' }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : sortedTemplates.length > 0 ? (
            <>
              <Grid
                container
                spacing={3}
              >
                {sortedTemplates.map((template) => (
                  <Grid
                    key={template.id}
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                  >
                    <TemplateCard 
                      template={template} 
                      onClick={() => handleTemplateClick(template)}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Infinite scroll loader */}
              {hasMore && (
                <Box
                  ref={loadMoreRef}
                  sx={{ py: 5, textAlign: 'center' }}
                >
                  {loading ? (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                    />
                  ) : null}
                </Box>
              )}
            </>
          ) : (
            <EmptyContent
              title="No templates found"
              description="This account doesn't have any public templates yet."
              sx={{
                '& span.MuiBox-root': { height: 160 },
              }}
            />
          )}
        </Box>
      </Container>

      {/* Template Details Dialog */}
      <TemplateDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        templateData={selectedTemplate}
      />
    </CompactLayout>
  );
};

export default AccountPage;
