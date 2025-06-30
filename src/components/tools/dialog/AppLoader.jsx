import { Card, Grid, Skeleton } from '@mui/material';
import { memo } from 'react';

const renderSkeletons = (count) => {
  return Array.from({ length: count }, (_, index) => (
    <Grid
      key={index}
      item
      xs={12}
      sm={4}
    >
      <Card sx={{ p: 2, m: 1, width: '100%' }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={90}
        />
        <Skeleton
          variant="text"
          width="60%"
        />
        <Skeleton
          variant="text"
          width="40%"
        />
      </Card>
    </Grid>
  ));
};

const AppLoader = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <Grid
      container
      spacing={2}
    >
      {renderSkeletons(6)}
    </Grid>
  );
};

export default memo(AppLoader);
