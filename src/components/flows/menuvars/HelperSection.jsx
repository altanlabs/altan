import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { memo, useCallback } from 'react';

import HelperMethodChip from './HelperMethodChip';
import { METHODS } from './helpers';
import Iconify from '../../iconify';

const HelperSection = ({ section, prefix, searchTerm = '', onSelect = null }) => {
  const filterSectionMethods = useCallback(
    (m) =>
      m.toLowerCase().includes(searchTerm) ||
      METHODS[prefix][m].description.toLowerCase().includes(searchTerm),
    [prefix, searchTerm],
  );
  const renderSectionMethod = useCallback(
    (method) => (
      <HelperMethodChip
        key={`helper-function-${prefix}.${method}`}
        prefix={prefix}
        method={METHODS[prefix][method]}
        onSelect={onSelect}
      />
    ),
    [onSelect, prefix],
  );

  return (
    <Stack
      spacing={0.5}
      width="100%"
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
      >
        <Typography variant="caption">{section.title.toUpperCase()}</Typography>
        <Tooltip
          arrow
          followCursor
          title={section.description}
        >
          <Iconify
            icon="mdi:info"
            width={10}
          />
        </Tooltip>
      </Stack>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'left',
          flexWrap: 'wrap',
          listStyle: 'none',
          gap: 0.5,
          m: 0,
        }}
      >
        {section.methods.filter(filterSectionMethods).map(renderSectionMethod)}
      </Box>
    </Stack>
  );
};

export default memo(HelperSection);
