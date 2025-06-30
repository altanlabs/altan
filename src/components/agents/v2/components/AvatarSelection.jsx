import { Avatar, Grid } from '@mui/material';
import React, { useState } from 'react';

const AvatarSelection = ({ setAvatarSrc }) => {
  const avatarCount = 15;
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const selectAvatar = (id) => {
    setSelectedAvatar(id);
    setAvatarSrc(`https://storage.googleapis.com/logos-chatbot-optimai/avatars/${id}.jpeg`);
  };

  return (
    <Grid
      container
      spacing={1}
    >
      {Array.from({ length: avatarCount }, (_, index) => (
        <Grid
          item
          xs={3}
          key={index + 1}
        >
          <Avatar
            src={`https://storage.googleapis.com/logos-chatbot-optimai/avatars/${index + 1}.jpeg`}
            alt={`Avatar ${index + 1}`}
            sx={{
              cursor: 'pointer',
              width: 56,
              height: 56,
              border: selectedAvatar === index + 1 ? '2px solid #4caf50' : 'none', // Highlight selected avatar
              opacity: selectedAvatar === index + 1 ? 1 : 0.4, // Dim non-selected avatars
              '&:hover': {
                opacity: 0.9,
              },
            }}
            onClick={() => selectAvatar(index + 1)}
          />
        </Grid>
      ))}
    </Grid>
  );
};
export default AvatarSelection;
