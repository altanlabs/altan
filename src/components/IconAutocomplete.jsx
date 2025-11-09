import {
  ImageList,
  ImageListItem,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import React, { useState } from 'react';

import Iconify from './iconify/Iconify';
import IconRenderer from './icons/IconRenderer';
import CustomDialog from './dialogs/CustomDialog';

const IconAutocomplete = ({ onChange, value = '' }) => {
  const [isSelecting, setIsSelecting] = useState(!value);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCustomUrlDialog, setOpenCustomUrlDialog] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const predefinedIcons = [
    'https://platform-api.altan.ai/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    'https://platform-api.altan.ai/media/a2e96123-60d6-412d-a978-24b5f719137d?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    'https://platform-api.altan.ai/media/9e7241f3-b86b-414a-9689-03d1b10f417b?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    'https://platform-api.altan.ai/media/0a9f6003-f359-4d8d-87ac-ce20db8ff951?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    'https://platform-api.altan.ai/media/8b49dc24-4435-42b6-8886-a209ee21f5f0?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    'https://platform-api.altan.ai/media/7465afc7-6889-4c84-a621-8edb4159d6e0?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    'https://platform-api.altan.ai/media/1c17eca6-bc1e-40ed-97c3-ef2506c61c3a?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',

    'https://cdn.jim-nielsen.com/ios/512/metronome-2024-08-13.png',
    'https://cdn.jim-nielsen.com/ios/512/scanner-doc-scan-pdf-document-2024-09-09.png',
    'https://cdn.jim-nielsen.com/ios/512/currenzy-2024-09-16.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/health-habit-tracker-happit-2024-10-04.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/barcodes-loyalty-card-wallet-2024-10-04.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/vaporcam-retro-filter-camera-2021-09-16.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/around-2021-07-20.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/linear-mobile-2024-10-04.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/id-by-amo-2024-04-13.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/couple-joy-love-games-2024-07-17.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/calzy-2024-09-16.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/blur-photo-2024-05-20.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/apple-maps-2021-12-07.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/brightmind-meditation-2024-07-03.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/suptho-2023-10-12.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/messages-2023-10-05.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/apollo-for-reddit-2023-07-07.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/radiant-for-mastodon-2023-06-22.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/dashkit-personal-dashboards-2023-05-17.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/md-clock-clock-widget-2022-06-21.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/aviary-2020-11-02.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/zeitgeist-2021-06-14.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/geoguessr-2022-06-08.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/ia-writer-2022-02-03.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/tasks-to-do-lists-planner-2023-01-05.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/tools-for-procreate-2023-05-16.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/walkie-messaging-on-the-go-2023-08-08.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/vaultvalue-2023-09-22.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/todays-budget-money-tracker-2023-09-22.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/hey-email-2024-08-05.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/daylio-journal-2022-05-13.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/remarkable-text-to-speech-2022-03-24.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/apple-business-essentials-2021-12-07.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/nightlight-led-flashlight-lamp-2021-04-26.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/hey-email-2021-01-30.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/apple-podcasts-2022-01-30.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/business-card-scanner-reader-2020-07-27.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/apple-music-classical-2023-10-05.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/apple-music-2020-09-25.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/jqbx-discover-music-together-2019-08-26.png?rf=1024',
    'https://cdn.jim-nielsen.com/ios/512/beat-video-leap-music-video-2021-02-22.png?rf=1024',
  ];

  const handleImageSelect = (imageUrl) => {
    onChange(imageUrl);
    setIsSelecting(false);
    setOpenDialog(false);
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl) {
      handleImageSelect(customUrl);
      setCustomUrl('');
      setOpenCustomUrlDialog(false);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={() => setOpenDialog(true)}
        sx={{ cursor: 'pointer' }}
      >
        {value ? (
          <IconRenderer
            icon={value}
            alt="Selected Icon"
            size={28}
            style={{
              width: 100,
              height: 100,
              borderRadius: '20%',
              objectFit: 'contain',
              padding: 8,
            }}
          />
        ) : (
          <Stack
            sx={{
              width: 100,
              height: 100,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: '20%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tooltip title="Select icon">
              <Iconify
                icon="mdi:plus"
                width={40}
              />
            </Tooltip>
          </Stack>
        )}
      </Stack>

      <CustomDialog
        dialogOpen={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Select Icon</DialogTitle>
        <DialogContent>
          <ImageList
            cols={6}
            gap={8}
            sx={{
              width: '100%',
              margin: 0,
            }}
          >
            <ImageListItem
              sx={{
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
                width: 75,
                height: 75,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: '20%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => {
                setOpenCustomUrlDialog(true);
              }}
            >
              <Tooltip title="Add custom URL">
                <Iconify
                  icon="mdi:plus"
                  width={32}
                />
              </Tooltip>
            </ImageListItem>

            {predefinedIcons.map((imageUrl) => (
              <ImageListItem
                key={imageUrl}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                  width: 75,
                  height: 75,
                  border: value === imageUrl ? '2px solid primary.main' : 'none',
                  borderRadius: '20%',
                }}
                onClick={() => handleImageSelect(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt="App Icon"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '20%',
                    objectFit: 'contain',
                    padding: 8,
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        dialogOpen={openCustomUrlDialog}
        onClose={() => setOpenCustomUrlDialog(false)}
      >
        <DialogTitle>Add Custom Icon URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder="Enter icon URL"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomUrlSubmit();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomUrlDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCustomUrlSubmit}
            variant="contained"
          >
            Add Icon
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
};

export default IconAutocomplete;
