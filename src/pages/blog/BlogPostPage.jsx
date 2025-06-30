import { Box, Stack, Container, Typography } from '@mui/material';
import { paramCase } from 'change-case';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

// @mui
// routes
// utils
// import axios from '../../utils/axios';
// components
import { posts as mockPosts } from './blogs';
import Markdown from '../../components/markdown';
import { useSettingsContext } from '../../components/settings';
// sections

import {
  BlogPostHero,
  BlogPostCard,
} from '../../sections/@dashboard/blog';

// ----------------------------------------------------------------------

export default function BlogPostPage() {
  const { themeStretch } = useSettingsContext();

  const { title } = useParams();
  const post = mockPosts.find((post) => post.meta_title === title);

  const recentPosts = mockPosts.filter((post) => post.meta_title !== title);

  const headline = post?.description
    ? `"${post.description}"`
    : '"Great article about something - Altan"';
  const image = post?.cover ? `"${post.cover}"` : '"https://source.unsplash.com/random"';
  const datePublished = post?.datePublished
    ? `"${post.datePublished}"`
    : '"2021-10-01T12:00:00+01:00"';
  const postURL = `/chat/blog/post/${paramCase(post.title)}`;

  return (
    <>
      <Helmet>
        <title>{`Blog: ${post?.title || 'Blog'} · Altan`}</title>
        <meta
          name="description"
          content={post?.description || 'Altan Blog Post'}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': postURL,
            },
            headline: headline,
            image: image,
            datePublished: datePublished,
            author: {
              '@type': 'Organization',
              name: 'Altan',
            },
          })}
        </script>
      </Helmet>

      <Container
        maxWidth={themeStretch ? false : 'lg'}
        sx={{ mb: 5 }}
      >
        {post && (
          <Stack
            sx={{
              borderRadius: 2,
              boxShadow: (theme) => ({
                md: theme.customShadows.card,
              }),
            }}
          >
            <BlogPostHero post={post} />

            <Typography
              variant="h6"
              sx={{
                py: 5,
                px: { md: 5 },
              }}
            >
              {post.description}
            </Typography>

            <Markdown
              children={post.body}
              sx={{
                px: { md: 5 },
              }}
            />

            {/* <Stack
              spacing={3}
              sx={{
                py: 5,
                px: { md: 5 },
              }}
            >
              <Divider />

              <BlogPostTags post={post} />

              <Divider />
            </Stack> */}

            {/* <Stack
              sx={{
                px: { md: 5 },
              }}
            >
              <Stack direction="row" sx={{ mb: 3 }}>
                <Typography variant="h4">Comments</Typography>

                <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
                  ({post.comments.length})
                </Typography>
              </Stack>

              <BlogPostCommentForm />

              <Divider sx={{ mt: 5, mb: 2 }} />
            </Stack> */}

            {/* <Stack
              sx={{
                px: { md: 5 },
              }}
            >
              <BlogPostCommentList comments={post.comments} />

              <Pagination
                count={8}
                sx={{
                  my: 5,
                  ml: 'auto',
                  mr: { xs: 'auto', md: 0 },
                }}
              />
            </Stack> */}
          </Stack>
        )}

        {/* <SkeletonPostDetails /> */}

        {!!recentPosts.length && (
          <>
            <Typography
              variant="h4"
              sx={{ my: 5 }}
            >
              Recent posts
            </Typography>

            <Box
              gap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              }}
            >
              {recentPosts.slice(recentPosts.length - 3).map((recentPost) => (
                <BlogPostCard
                  key={recentPost.id}
                  post={recentPost}
                />
              ))}
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
