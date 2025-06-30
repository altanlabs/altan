import { Card, Typography, Grid, Button, Menu, MenuItem } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CreateInterfaceDialog from './components/CreateInterfaceDialog.jsx';
import NoEntityPlaceholder from '../../../components/databases/placeholders/NoEntityPlaceholder';
import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland';
import Iconify from '../../../components/iconify/Iconify';
import AltanLogo from '../../../components/loaders/AltanLogo';
import { CompactLayout } from '../../../layouts/dashboard';
import { deleteInterfaceById, selectAccount } from '../../../redux/slices/general';
import { dispatch, useSelector } from '../../../redux/store';

const selectInterfaces = (state) => selectAccount(state)?.interfaces;
const getInterfacesInitialized = (state) => state.general.accountAssetsInitialized.interfaces;
// const getInterfacesLoading = (state) => state.general.accountAssetsLoading.interfaces;

function InterfacesPage() {
  const interfaces = useSelector(selectInterfaces);
  const interfacesInitialized = useSelector(getInterfacesInitialized);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleCardClick = useCallback(
    (id) => {
      navigate(`/interfaces/${id}`);
    },
    [navigate],
  );

  const handleContextMenu = useCallback((event, ui) => {
    event.preventDefault();
    setSelectedInterface(ui);
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleEdit = useCallback(() => {
    setCreateDialogOpen(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const onCloseCreateInterface = useCallback(() => {
    setCreateDialogOpen(false);
    setSelectedInterface(null);
  }, []);

  const onCreateInterface = useCallback(() => setCreateDialogOpen(true), []);

  const confirmDelete = useCallback(() => {
    if (!selectedInterface?.id) {
      return;
    }
    setIsSubmitting(true);
    dispatch(deleteInterfaceById(selectedInterface.id))
      .then(() => {
        setShowDeleteDialog(false);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [selectedInterface?.id]);

  return (
    <CompactLayout title="Interfaces · Altan">
      {!interfacesInitialized && (
        <AltanLogo
          fixed
          messages="Loading workspace interfaces..."
        />
      )}
      {!!interfaces?.length ? (
        <Grid
          container
          spacing={2}
        >
          {interfaces.map((ui) => (
            <Grid
              item
              key={ui.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Card
                className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-300"
                onClick={() => handleCardClick(ui.id)}
                onContextMenu={(e) => handleContextMenu(e, ui)}
                sx={{
                  bgcolor: 'rgb(32, 32, 32)',
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                <div className="w-full aspect-video bg-[#2a2a2a]">
                  <img
                    src={
                      ui.cover_url ||
                      'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7'
                    }
                    alt={ui.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target;
                      target.onerror = null;
                      target.src =
                        'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7';
                    }}
                  />
                </div>
                <Typography
                  variant="body2"
                  className="px-3 py-2 text-gray-200"
                >
                  {ui.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoEntityPlaceholder
          title="No interfaces found"
          description="Create your first interface to get started"
          buttonMessage="Create Interface"
          onButtonClick={onCreateInterface}
        />
      )}

      {interfaces?.length > 0 && (
        <DynamicIsland>
          <Button
            size="large"
            variant="soft"
            color="secondary"
            onClick={onCreateInterface}
          >
            Create interface
          </Button>
        </DynamicIsland>
      )}

      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        <MenuItem onClick={handleEdit}>
          <Iconify
            icon="mdi:pencil"
            sx={{ mr: 2 }}
          />
          Edit Interface
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Iconify
            icon="mdi:delete"
            sx={{ mr: 2 }}
          />
          Delete Interface
        </MenuItem>
      </Menu>

      <CreateInterfaceDialog
        open={createDialogOpen}
        onClose={onCloseCreateInterface}
        interfaceToEdit={selectedInterface}
      />

      <DeleteDialog
        openDeleteDialog={showDeleteDialog}
        handleCloseDeleteDialog={() => setShowDeleteDialog(false)}
        confirmDelete={confirmDelete}
        isSubmitting={isSubmitting}
        message={`Are you sure you want to delete the interface "${selectedInterface?.label}"? This action cannot be undone.`}
        confirmationText={selectedInterface?.label}
      />
    </CompactLayout>
  );
}

export default InterfacesPage;
