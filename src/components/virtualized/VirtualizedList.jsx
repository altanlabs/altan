import { Skeleton, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';

const VirtualizedList = ({
  data,
  renderItem,
  listId = 'unknown',
  initialized = false,
  height = '90vh',
  noDataMessage = 'No data found',
}) => {
  if (!initialized) {
    return (
      <Stack
        width="100%"
        height="100%"
        spacing={0.5}
      >
        {[...Array(20)].map((_, i) => (
          <Skeleton
            key={`skeleton-${listId}-${i}`}
            width="100%"
            height={50}
            variant="rounded"
          />
        ))}
      </Stack>
    );
  }

  if (!data?.length) {
    return <Typography p={2}>{noDataMessage}</Typography>;
  }

  return (
    <Virtuoso
      key={`virtualized-${listId}`}
      style={{
        maxWidth: '100%',
        scrollBehavior: 'smooth',
        overflowX: 'hidden',
        height,
      }}
      data={data}
      components={{
        Footer: () => {
          return (
            <div
              style={{
                height: '10px',
              }}
            />
          );
        },
        Header: () => {
          return (
            <div
              style={{
                height: '10px',
              }}
            />
          );
        },
      }}
      overscan={2}
      increaseViewportBy={{
        bottom: 0,
        top: 0,
      }}
      itemContent={renderItem}
    />
  );
};

export default memo(VirtualizedList);
