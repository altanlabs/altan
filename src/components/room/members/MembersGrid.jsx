import { Grid, Box, Typography, useTheme } from '@mui/material';
import React from 'react';

import CustomAvatar from '../../avatars/CustomAvatar';

const MembersGrid = ({ members, handleCreate, selectedMembers = [] }) => {
  const theme = useTheme();
  return (
    <Grid container spacing={1} sx={{ width: '100%', margin: 0 }}>
      {members.map((option) => (
        <Grid item xs={6} sm={4} md={3} key={option.id}>
          <Box
            onClick={() => handleCreate(option)}
            sx={{
              borderRadius: '1rem',
              overflow: 'hidden',
              p: 2,
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              background: selectedMembers.some(member => member.id === option.id) ? theme.palette.background.paper : 'transparent',
              transition: 'transform 0.3s',
              ':hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {
              !!(option.agent || option.user) && (
                <CustomAvatar
                  sx={{ width: 56, height: 56 }}
                  name={option.user ? option.name : option.agent.name}
                  src={
                    option.member_type === 'agent'
                      ? option.agent.avatar_url
                      : `https://storage.googleapis.com/logos-chatbot-optimai/user/${option.user.id}`
                  }
                />
              )
            }

            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: 'text.primary',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {option.user ? option.name : option.agent.name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default MembersGrid;
