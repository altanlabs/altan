import { Stack, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';

import HelperSection from './HelperSection';
import Iconify from '../../iconify';

const HelperGroup = ({ group, searchTerm = '', onSelect = null, ...other }) => {
  return (
    <Stack
      spacing={0.75}
      width="100%"
      {...other}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
      >
        <Typography variant="body1">{group.title}</Typography>
        <Tooltip
          arrow
          followCursor
          title={group.description}
        >
          <Iconify
            icon="mdi:info"
            width={10}
          />
        </Tooltip>
      </Stack>
      {Object.entries(group.sections).map(([name, section]) => (
        <HelperSection
          key={`section-${name}`}
          section={section}
          prefix={group.prefix}
          searchTerm={searchTerm}
          onSelect={onSelect}
        />
      ))}
    </Stack>
  );
};

export default memo(HelperGroup);
