import { Grid, Typography, Container, Stack, Link } from '@mui/material';
import { paramCase } from 'change-case';
import orderBy from 'lodash/orderBy';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
// utils
// routes
import { Link as RouterLink } from 'react-router-dom';

// components
import { posts as mockPosts } from './blogs';
import { useSettingsContext } from '../../components/settings';
import { SkeletonPostItem } from '../../components/skeleton';
// sections
import { BlogPostCard, BlogPostsSort } from '../../sections/@dashboard/blog';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
];

// ----------------------------------------------------------------------

export default function BlogPostsPage() {
  const { themeStretch } = useSettingsContext();

  const [posts, setPosts] = useState(mockPosts);

  const [sortBy, setSortBy] = useState('latest');

  const sortedPosts = applySortBy(posts, sortBy);

  useEffect(() => {
    if (sortBy === 'latest') {
      setPosts((prev) =>
        [...prev].sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished)),
      );
    } else if (sortBy === 'oldest') {
      setPosts((prev) =>
        [...prev].sort((a, b) => new Date(a.datePublished) - new Date(b.datePublished)),
      );
    }
  }, [sortBy]);

  const handleChangeSortBy = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <>
      <Helmet>
        <title> Blog: Posts · Altan</title>
      </Helmet>

      <Container
        maxWidth={themeStretch ? false : 'lg'}
        sx={{ mb: 8 }}
      >
        <Stack
          mb={5}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1 }}
        >
          {/* <BlogPostsSearch /> */}
          <Typography variant="h2">Blog</Typography>
          <BlogPostsSort
            sortBy={sortBy}
            sortOptions={SORT_OPTIONS}
            onSort={handleChangeSortBy}
          />
        </Stack>

        <Grid
          container
          spacing={3}
        >
          {(!posts.length ? [...Array(12)] : sortedPosts).map((post, index) => {
            return post ? (
              <Grid
                key={post.id}
                item
                xs={12}
                sm={6}
                md={(index === 0 && 6) || 3}
              >
                <Link
                  component={RouterLink}
                  to={`/blog/post/${paramCase(post.title)}`}
                  color="inherit"
                >
                  <BlogPostCard
                    post={post}
                    index={index}
                  />
                </Link>
              </Grid>
            ) : (
              <SkeletonPostItem key={index} />
            );
          })}
        </Grid>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

const applySortBy = (posts, sortBy) => {
  if (sortBy === 'latest') {
    return orderBy(posts, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    return orderBy(posts, ['createdAt'], ['asc']);
  }
  return posts;
};
