import { Avatar, Box, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
// @mui
// utils

// components

// ----------------------------------------------------------------------

const StyledInfo = styled('div')(({ theme }) => ({
  zIndex: 99,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    right: 'auto',
    left: theme.spacing(2),
    bottom: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

ProfileCover.propTypes = {
  cover: PropTypes.string,
  name: PropTypes.string,
};

export default function ProfileCover({ name, src }) {
  return (
    <>
      <StyledInfo>
        <Avatar
          src={src}
          alt={name}
          name={name}
          sx={{
            width: { xs: 20, md: 40 },
            height: { xs: 20, md: 40 },
          }}
        />

        <Box
          sx={{
            ml: { md: 3 },
            mt: { xs: 1, md: 0 },
            color: 'common.white',
            textAlign: { xs: 'center' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="h5">{name}</Typography>
            </Box>
          </Box>

        </Box>

      </StyledInfo>
      <Divider />
    </>
  );
}
