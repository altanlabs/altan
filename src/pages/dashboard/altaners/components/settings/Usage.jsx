import { Box, Card, Typography, Stack } from '@mui/material';

import Iconify from '../../../../../components/iconify/Iconify';

const Usage = ({ sections }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, fontSize: '0.875rem' }}
      >
        Usage
      </Typography>

      <Stack spacing={2}>
        {Object.entries(sections).map(([key, section]) => (
          <Card
            key={key}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Iconify
                icon={section.icon}
                width={20}
              />
              <Box>
                <Typography variant="subtitle2">{section.title}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {section.description}
                </Typography>
              </Box>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Usage;
