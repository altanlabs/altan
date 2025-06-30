// @mui
import { Typography, Stack, Button } from '@mui/material';
import PropTypes from 'prop-types';
//
import { useNavigate } from 'react-router';

import Image from '../image';

// ----------------------------------------------------------------------

EmptyContent.propTypes = {
  sx: PropTypes.object,
  img: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default function EmptyContent({ title, description, img, onCreate, sx, ...other }) {
  const navigate = useNavigate();
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        height: 1,
        textAlign: 'center',
        p: (theme) => theme.spacing(8, 2),
        ...sx,
      }}
      {...other}
    >
      <Image
        disabledEffect
        alt="empty content"
        src={img || '/assets/illustrations/illustration_empty_content.svg'}
        sx={{ height: 240, mb: 3 }}
      />

      <Typography
        variant="h5"
        gutterBottom
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {description}
        </Typography>
      )}
      {onCreate && (
        <Button
          variant="soft"
          color="secondary"
          size="large"
          onClick={onCreate}
        >
          Create Portal
        </Button>
      )}
    </Stack>
  );
}
