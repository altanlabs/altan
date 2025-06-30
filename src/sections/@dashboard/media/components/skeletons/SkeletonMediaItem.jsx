import { Stack, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';
// @mui

// ----------------------------------------------------------------------

SkeletonMediaItem.propTypes = {
  sx: PropTypes.object,
};

export default function SkeletonMediaItem({ sx, ...other }) {
  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      sx={{ px: 3, py: 1.5 }}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
      />

      {/* <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" sx={{ width: '100%', height: 16 }} />
        <Skeleton variant="text" sx={{ width: '100%', height: 12 }} />
      </Stack> */}
    </Stack>
  );
}
