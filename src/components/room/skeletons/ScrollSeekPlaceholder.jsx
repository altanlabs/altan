import { Skeleton, Stack, useTheme } from '@mui/material';
import React, { memo } from 'react';

function getRandomInt(min, max) {
  const temp_min = Math.ceil(min);
  return Math.floor(Math.random() * (Math.floor(max) - temp_min + 1)) + temp_min;
}

function getRandom(weights, results) {
  const num = Math.random(),
    lastIndex = weights.length - 1;
  let s = 0;

  for (let i = 0; i < lastIndex; ++i) {
    s += weights[i];
    if (num < s) {
      return results[i];
    }
  }

  return results[lastIndex];
};

function getRandomImage() {
  const weights = [0.7, 0.3]; // probabilities
  const results = [0, 1]; // values to return
  return getRandom(weights, results);
}

function getRandomLine(height = null) {
  const weights = [0.3, 0.2, 0.15, 0.1, 0.1, 0.1, 0.05]; // probabilities
  const results = [1, 2, 3, 4, 5, 6, 7]; // values to return

  if (height !== null) {
    // Calculate the maximum number of lines that can fit
    const maxLines = Math.floor((height - 35) / 35);
    if (maxLines < 1) {
      // If height is too small for even one line, return an error or a default value
      return 'Error: Height too small for any lines';
    } else {
      // Return a random line number within the range of available lines
      return Math.floor(Math.random() * maxLines) + 1;
    }
  } else {
    // Use the predefined weights and results
    return getRandom(weights, results);
  }
}

const SkeletonColumn = ({ width = null }) => {
  const columnWidth = width ?? getRandomInt(5, 15);
  return (
    <Skeleton variant="text" width={`${columnWidth}%`} style={{ marginBottom: 2, height: 20 }} />
  );
};

const SkeletonLine = ({ id, columns = null }) => {
  const lineColumns = columns !== null ? columns.length : getRandomInt(3, 7);
  return (
    <Stack
      direction="row"
      spacing={0.5}
    >
      {
        [...Array(lineColumns)].map((_, index) => (
          <SkeletonColumn width={columns === null ? null : columns[index]} key={`${id}_column_${index}`} />
        ))
      }
    </Stack>
  );
};

const ScrollSeekPlaceholder = ({
  index,
  height = null,
  disableImage = false,
  lines = null,
}) => {
  const theme = useTheme();

  // Define dynamic heights for the placeholders
  const avatarSize = 30; // Size of the avatar placeholder
  const heights = {
    short: 15, // Short text line
    medium: 20, // Medium text line
    long: 25, // Long text line
  };

  // Inline styles for the placeholders
  const styles = {
    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: '50%',
      marginRight: theme.spacing(2),
    },
    line: (height) => ({
      height: height,
      marginBottom: theme.spacing(1),
    }),
    container: {
      display: 'flex',
      alignItems: 'start',
      marginBottom: theme.spacing(2),
    },
    image: {
      height: 100,
      marginTop: 10,
      borderRadius: 5,
      maxWidth: 200,
    },
  };

  // Generate a set of placeholder lines with varying lengths

  const l = lines !== null ? lines.length : getRandomLine(height);
  const hasImage = !disableImage && (l < 3) ? getRandomImage() : 0;

  return (
    <div className="overflow-hidden items-start min-w-[200px] mx-auto w-full">
      <Stack key={index} direction="row" spacing={2} p={1} alignItems="flex-start">
        <Skeleton variant="circular" width={40} height={40} />
        <Stack spacing={1} width="100%">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" width="100%" height={60} />
        </Stack>
      </Stack>
    </div>
  );
};

export default memo(ScrollSeekPlaceholder);
