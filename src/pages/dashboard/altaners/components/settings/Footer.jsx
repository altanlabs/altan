import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, Tooltip } from '@mui/material';

import Iconify from '../../../../../components/iconify/Iconify';

const Footer = ({ altaner, isSubmitting, isDirty, onSubmit, secondLevelSection }) => {
  const hasTemplate = !!altaner?.template;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: { xs: '100%', sm: 400 },
        p: 2,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
      >
        {hasTemplate && altaner?.template && (
          <Tooltip
            arrow
            placement="top"
            title={
              !altaner.template.is_visible
                ? 'Make the template visible (Distribution · Overview) in order to view in the template in the marketplace'
                : !altaner.template.public_name
                    ? 'Set the public name (Distribution · Overview) in order to view in the template in the marketplace'
                    : 'View template in marketplace'
            }
          >
            <div>
              <Button
                component="a"
                href={`https://altan.ai/marketplace/${altaner.template.public_name}`}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!altaner.template.public_name || !altaner.template.is_visible}
                variant="outlined"
              >
                View in marketplace
              </Button>
            </div>
          </Tooltip>
        )}
        {secondLevelSection !== 'versions' && (
          <LoadingButton
            startIcon={<Iconify icon="dashicons:saved" />}
            color="secondary"
            variant="soft"
            size="large"
            loading={isSubmitting}
            onClick={onSubmit}
            disabled={!isDirty}
          >
            Save
          </LoadingButton>
        )}
      </Stack>
    </Box>
  );
};

export default Footer;
