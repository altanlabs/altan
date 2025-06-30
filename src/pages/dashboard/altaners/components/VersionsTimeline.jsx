import { Button, Card, Stack, Typography, IconButton } from '@mui/material';
import { memo, useState } from 'react';

import Iconify from '../../../../components/iconify/Iconify.jsx';

const VersionCard = ({ version }) => {
  const versionString = `${version.major}.${version.minor}.${version.patch}`;

  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2">{version.name || `Version ${versionString}`}</Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'monospace' }}
          >
            {version.id}
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(version.id);
            }}
            sx={{ p: 0 }}
          >
            <Iconify
              icon="mdi:content-copy"
              width={12}
            />
          </IconButton>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {versionString} · {new Date(version.date_creation).toLocaleDateString()}
        </Typography>
        {version.description && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {version.description}
          </Typography>
        )}
      </Stack>
    </Card>
  );
};

const VersionsTimeline = ({ versions }) => {
  const [showAll, setShowAll] = useState(false);

  if (!versions?.length) {
    return (
      <Card
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          No versions available
        </Typography>
      </Card>
    );
  }

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
  );

  const displayedVersions = showAll ? sortedVersions : [sortedVersions[0]];

  return (
    <Stack spacing={2}>
      {displayedVersions.map((version) => (
        <VersionCard
          key={version.id}
          version={version}
        />
      ))}
      {versions.length > 1 && (
        <Button
          variant="text"
          color="primary"
          onClick={() => setShowAll(!showAll)}
          sx={{ alignSelf: 'center' }}
        >
          {showAll
            ? 'Show less'
            : `Show ${versions.length - 1} more version${versions.length > 2 ? 's' : ''}`}
        </Button>
      )}
    </Stack>
  );
};

export default memo(VersionsTimeline);
