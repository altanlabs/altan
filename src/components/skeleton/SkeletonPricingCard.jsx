import { Card, Skeleton, Stack, Box, Divider, List, ListItem } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonPricingCard({ highlighted = false, ...other }) {
  return (
    <Card
      sx={{
        p: 4,
        position: 'relative',
        ...(highlighted && {
          transform: 'scale(1.05)',
          zIndex: 1,
        }),
      }}
      {...other}
    >
      {/* Title and Description */}
      <Box sx={{ mb: 3 }}>
        <Skeleton
          variant="text"
          sx={{ width: 0.4, height: 32, mb: 1 }}
        />
        <Skeleton
          variant="text"
          sx={{ width: 0.8, height: 20, mb: 1 }}
        />
        <Skeleton
          variant="text"
          sx={{ width: 0.6, height: 20, mb: 2 }}
        />

        {/* Price */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={0.5}
            sx={{ mb: 1 }}
          >
            <Skeleton
              variant="text"
              sx={{ width: 80, height: 48 }}
            />
            <Skeleton
              variant="text"
              sx={{ width: 30, height: 24 }}
            />
          </Stack>
          <Skeleton
            variant="text"
            sx={{ width: 0.7, height: 16 }}
          />
        </Box>
      </Box>

      {/* Growth plan selector (only for highlighted cards) */}
      {highlighted && (
        <Box sx={{ mb: 3 }}>
          <Skeleton
            variant="text"
            sx={{ width: 0.6, height: 20, mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: 56, borderRadius: 1 }}
          />
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Features List */}
      <List
        disablePadding
        sx={{ mb: 3 }}
      >
        {Array.from(Array(6)).map((_, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ py: 0.5 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ width: '100%' }}
            >
              <Skeleton
                variant="circular"
                sx={{ width: 20, height: 20 }}
              />
              <Skeleton
                variant="text"
                sx={{ width: `${Math.random() * 40 + 40}%`, height: 20 }}
              />
            </Stack>
          </ListItem>
        ))}
      </List>

      {/* Button */}
      <Skeleton
        variant="rectangular"
        sx={{ width: '100%', height: 48, borderRadius: 1 }}
      />
    </Card>
  );
} 