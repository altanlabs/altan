import {
  Card,
  Typography,
  Button,
  Stack,
  Box,
  ButtonGroup,
  Tooltip,
  IconButton,
} from '@mui/material';
import { capitalize } from 'lodash';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import CreateEditGate from './CreateEditGate';
import ShareGate from './ShareGate';
import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import Iconify from '../../../components/iconify/Iconify';
import AgentCard from '../../../components/members/AgentCard';
import useResponsive from '../../../hooks/useResponsive';

export default function GateCard({ gate, onDelete }) {
  const isSmallScreen = useResponsive('down', 'md');
  const { account } = useSelector((state) => state.general);
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);

  const agent = useMemo(
    () => !!account?.agents && (account.agents.find((obj) => obj.id === gate.agent_id) || {}),
    [account?.agents, gate?.agent_id],
  );

  const handleOpenGateAdmin = () => {
    window.open(`https://app.altan.ai/account/${gate.account_id}/gates/${gate.id}`, '_blank');
  };

  const handleDelete = () => {
    onDelete();
    setOpenDeleteDialog(false);
  };

  if (isEditing) {
    return (
      <CreateEditGate
        gate={gate}
        handleClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <Box className="p-4">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          className="w-full"
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'start', md: 'center' },
          }}
        >
          {/* Left Section: Agent Info and Gate Name */}
          <Stack
            direction={isSmallScreen ? 'column' : 'row'}
            spacing={2}
            alignItems={isSmallScreen ? 'start' : 'center'}
          >
            <AgentCard
              agent={agent}
              minified={true}
              tooltipText={`${agent.name} is the agent assigned to ${gate.name}`}
            />
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Tooltip
                arrow
                followCursor
                title={capitalize(gate?.status)}
              >
                <IconButton
                  size="small"
                  className={gate?.status === 'opened' ? 'text-green-500' : 'text-red-500'}
                >
                  <Iconify icon="uil:channel" />
                </IconButton>
              </Tooltip>
              <Typography
                variant="h6"
                className="font-semibold"
              >
                {gate?.name}
              </Typography>
            </Stack>
          </Stack>

          {/* Right Section: Action Buttons */}
          <ButtonGroup
            variant="soft"
            className="shadow-sm"
          >
            <Button
              onClick={handleOpenGateAdmin}
              startIcon={<Iconify icon="material-symbols:captive-portal" />}
              className="px-4"
              color="inherit"
            >
              <span className="hidden sm:inline">Admin</span>
            </Button>

            <Button
              onClick={() => setOpenShareDialog(true)}
              startIcon={<Iconify icon="mdi:share" />}
              className="px-4"
            >
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              onClick={() => setIsEditing(true)}
              startIcon={<Iconify icon="solar:settings-bold-duotone" />}
              color="info"
              className="px-4"
            >
              <span className="hidden sm:inline">Settings</span>
            </Button>

            <Button
              onClick={() => setOpenDeleteDialog(true)}
              startIcon={<Iconify icon="mdi:trash-can-outline" />}
              color="error"
              className="px-4"
            >
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </ButtonGroup>
        </Stack>
      </Box>

      {/* Dialogs */}
      <DeleteDialog
        openDeleteDialog={openDeleteDialog}
        handleCloseDeleteDialog={() => setOpenDeleteDialog(false)}
        confirmDelete={handleDelete}
        message={`Are you sure you want to delete the gate "${gate.name}"? This action cannot be undone.`}
        confirmationText={gate.name}
      />

      <ShareGate
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        gateId={gate.id}
      />
    </Card>
  );
}
