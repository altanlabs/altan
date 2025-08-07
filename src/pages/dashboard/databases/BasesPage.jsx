import { Card, CardContent, Typography, Grid, Button, Menu, MenuItem } from '@mui/material';
import { useCallback, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import CreateBaseDialog from '../../../components/databases/base/CreateBaseDialog';
import DuplicateBaseDialog from '../../../components/databases/base/DuplicateBaseDialog';
import NoEntityPlaceholder from '../../../components/databases/placeholders/NoEntityPlaceholder';
import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland';
import Iconify from '../../../components/iconify/Iconify';
import AltanLogo from '../../../components/loaders/AltanLogo';
import { CompactLayout } from '../../../layouts/dashboard';
import { deleteBaseById, getBasesByAccountID } from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';

// Selector que convierte el objeto de bases en un array
const selectBasesArray = (state) => {
  const basesObject = state.bases.bases;
  return Object.values(basesObject || {});
};
const getBasesInitialized = (state) => state.general.accountAssetsInitialized.bases;
// const getBasesLoading = (state) => state.general.accountAssetsLoading.bases;

function BasesPage() {
  const databases = useSelector(selectBasesArray);
  const basesInitialized = useSelector(getBasesInitialized);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const history = useHistory();

  const accountId = useSelector((state) => state.general?.account?.id);

  useEffect(() => {
    if (accountId) {
      dispatch(getBasesByAccountID(accountId));
    }
  }, [accountId]);

  const handleCardClick = useCallback(
    (id) => {
      console.log('navigating BASES PAGE');
      history.push(`/bases/${id}`);
    },
    [history.push],
  );

  const handleContextMenu = useCallback((event, base) => {
    event.preventDefault();
    setSelectedBase(base);
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleEdit = useCallback(() => {
    setCreateDialogOpen(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const handleDuplicate = useCallback(() => {
    setDuplicateDialogOpen(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const onCloseCreateBase = useCallback(() => {
    setCreateDialogOpen(false);
    setSelectedBase(null);
  }, []);

  const onCloseDuplicateBase = useCallback(() => {
    setDuplicateDialogOpen(false);
    setSelectedBase(null);
  }, []);

  const onCreateBase = useCallback(() => setCreateDialogOpen(true), []);

  const confirmDelete = useCallback(() => {
    if (!selectedBase?.id) {
      return;
    }
    setIsSubmitting(true);
    dispatch(deleteBaseById(selectedBase.id))
      .then(() => {
        setShowDeleteDialog(false);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [selectedBase?.id]);

  return (
    <CompactLayout title="Bases · Altan">
      {!basesInitialized && (
        <AltanLogo
          fixed
          messages="Loading workspace bases..."
        />
      )}
      {!!databases?.length ? (
        <Grid
          container
          spacing={3}
        >
          {databases.map((db) => (
            <Grid
              item
              key={db.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Card
                className="shadow-md rounded-lg border cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => handleCardClick(db.id)}
                onContextMenu={(e) => handleContextMenu(e, db)}
              >
                <CardContent>
                  <div className="flex items-center">
                    <div className="bg-purple-500 rounded-full p-3 mr-4">
                      <Iconify
                        icon={db.icon}
                        fontSize="large"
                        className="text-white"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="h6"
                        component="div"
                        className="font-semibold"
                      >
                        {db.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                      >
                        Base {db.description}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoEntityPlaceholder
          title="No bases found in this workspace"
          description="Create your first base to get started"
          buttonMessage="Create Base"
          onButtonClick={onCreateBase}
        />
      )}

      {databases?.length > 0 && (
        <DynamicIsland>
          <Button
            size="large"
            variant="soft"
            color="secondary"
            onClick={onCreateBase}
          >
            Create base
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
          Edit Base
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <Iconify
            icon="mdi:content-copy"
            sx={{ mr: 2 }}
          />
          Duplicate Base
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Iconify
            icon="mdi:delete"
            sx={{ mr: 2 }}
          />
          Delete Base
        </MenuItem>
      </Menu>

      <CreateBaseDialog
        open={createDialogOpen}
        onClose={onCloseCreateBase}
        baseToEdit={selectedBase}
      />

      <DuplicateBaseDialog
        open={duplicateDialogOpen}
        onClose={onCloseDuplicateBase}
        baseToClone={selectedBase}
      />

      <DeleteDialog
        openDeleteDialog={showDeleteDialog}
        handleCloseDeleteDialog={() => setShowDeleteDialog(false)}
        confirmDelete={confirmDelete}
        isSubmitting={isSubmitting}
        message={`Are you sure you want to delete the base "${selectedBase?.name}"? This action cannot be undone.`}
        confirmationText={selectedBase?.name}
      />
    </CompactLayout>
  );
}

export default BasesPage;
