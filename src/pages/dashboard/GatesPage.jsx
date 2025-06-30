import { Stack, Container, Dialog } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import DeleteDialog from './superadmin/tables/DeleteDialog';
import SearchField from '../../components/custom-input/SearchField';
import NoEntityPlaceholder from '../../components/databases/placeholders/NoEntityPlaceholder';
import SkeletonStack from '../../components/SkeletonStack';
import { CompactLayout } from '../../layouts/dashboard';
import { deleteGate, getGates } from '../../redux/slices/gates';
import { dispatch } from '../../redux/store';
import CreateEditGate from '../../sections/@dashboard/gates/CreateEditGate';
import GateCard from '../../sections/@dashboard/gates/GateCard';
import GateDialog from '../../sections/@dashboard/gates/GateDialog';
import Each from '../../utils/each';

export default function GatesPage() {
  console.log('HGates page');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [gateToDelete, setGateToDelete] = useState(null);
  const accountId = useSelector((state) => state.general.account?.id);
  const { gates, initialized, isLoading } = useSelector((state) => state.gates);
  const [openCreateEditDialog, setOpenCreateEditDialog] = useState(false);

  useEffect(() => {
    if (!initialized.gates && !isLoading.gates) {
      dispatch(getGates());
    }
  }, [initialized.gates, isLoading.gates, accountId]);

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };
  const filteredGates = gates.filter(
    (gate) => gate.name && gate.name.toLowerCase().includes(searchTerm),
  );

  const handleDeleteGate = () => {
    if (gateToDelete) {
      dispatch(deleteGate(gateToDelete.id));
    }
    onDeleteClose();
  };

  const onGateDelete = (gate) => {
    setGateToDelete(gate);
    setOpenDeleteDialog(true);
  };

  const onDeleteClose = () => {
    setGateToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleCreateEditClose = () => {
    setOpenCreateEditDialog(false);
  };

  return (
    <CompactLayout
      title={'Gates · Altan'}
      breadcrumb={{
        title: 'Gates',
        links: [
          {
            name: 'Dashboard',
          },
          {
            name: 'Gates',
          },
        ],
      }}
      toolbarChildren={
        <Stack
          direction="row"
          alignItems="center"
        >
          <SearchField
            value={searchTerm}
            placeholder="Search gate..."
            onChange={handleSearchChange}
            size="small"
          />
          <GateDialog />
        </Stack>
      }
    >
      <Container>
        {initialized ? (
          filteredGates.length > 0 ? (
            <Stack
              spacing={2}
              paddingTop={2}
              paddingBottom={15}
            >
              <Each
                of={filteredGates}
                render={(gate, index) => (
                  <GateCard
                    gate={gate}
                    onDelete={() => onGateDelete(gate)}
                  />
                )}
              />
            </Stack>
          ) : (
            <NoEntityPlaceholder
              title="No gates found"
              description="Why not create one?"
              buttonMessage="Create gate"
              onButtonClick={() => setOpenCreateEditDialog(true)}
            />
          )
        ) : (
          <SkeletonStack
            count={5}
            height="90px"
          />
        )}
      </Container>
      <DeleteDialog
        openDeleteDialog={openDeleteDialog}
        handleCloseDeleteDialog={onDeleteClose}
        confirmDelete={handleDeleteGate}
        message="Are you sure you want to delete the gate? All settings and all rooms associated to it with be deleted, too."
        confirmationText={
          !!gateToDelete?.name ? `DELETE ${gateToDelete.name.toUpperCase()}` : 'DELETE GATE'
        }
      />
      <Dialog
        open={openCreateEditDialog}
        handleClose={handleCreateEditClose}
      >
        <CreateEditGate />
      </Dialog>
    </CompactLayout>
  );
}
