import { Stack, Typography, Box, Card, Button, ButtonGroup } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Upload3dDialog from './Upload3dDialog';
import { API_BASE_URL } from '../../../auth/utils';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland';
import Iconify from '../../../components/iconify';
import useResponsive from '../../../hooks/useResponsive';
import { deleteModel } from '../../../redux/slices/media';

const ModelSection = ({}) => {
  const [is3dDialogOpen, setIs3dDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { initialized, isLoading, models } = useSelector((state) => state.media);
  const isMobile = useResponsive('down', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(new Set());
  const handleDelete = (model) => {
    setIsDeleting(true);
    enqueueSnackbar('Deleting model', { variant: 'info' });
    try {
      dispatch(deleteModel(model.id));
      enqueueSnackbar('Deleted', { variant: 'success' });
      setIsDeleting(false);
    } catch (e) {
      setIsDeleting(false);
      enqueueSnackbar(`Error deleting media: ${e}`, { variant: 'error' });
      console.error(`Error deleting media: ${e}`);
    }
  };

  const handleView = (model) => {
    window.open(`${API_BASE_URL}/platform/media/3d/${model.id}`, '_blank');
  };

  return (
    <>
      <Stack
        spacing={1.5}
        padding={0}
        sx={{
          height: '100%',
        }}
      >
        {models.map((model, i) => (
          <Card
            sx={{ p: 3 }}
            key={model.id}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6">{model.name}</Typography>
                <Typography variant="body1">{model.description}</Typography>
              </Box>
              <ButtonGroup variant="soft">
                <Button
                  color="secondary"
                  onClick={() => handleView(model)}
                >
                  View
                </Button>
                {/* <Button>
                    Edit
                  </Button> */}
                <Button
                  color="error"
                  onClick={() => handleDelete(model)}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </Box>
          </Card>
        ))}

        <DynamicIsland>
          {selectedMedia.size > 0 && (
            <Button
              color="error"
              variant="contained"
              startIcon={<Iconify icon="eva:trash-2-outline" />}
              onClick={handleDelete}
              sx={{ mr: 1 }}
            >
              {isDeleting ? 'Deleting...' : `Delete ${selectedMedia.size} Media`}
            </Button>
          )}
          <ButtonGroup>
            <Button
              size="large"
              variant="contained"
              color="info"
              endIcon={
                <Iconify
                  icon="iconamoon:3d-fill"
                  width={30}
                />
              }
              onClick={() => setIs3dDialogOpen(true)}
            >
              Add 3d models
            </Button>
          </ButtonGroup>
        </DynamicIsland>

        <Upload3dDialog
          open={is3dDialogOpen}
          onClose={() => setIs3dDialogOpen(false)}
        />
      </Stack>
    </>
  );
};

export default memo(ModelSection);
