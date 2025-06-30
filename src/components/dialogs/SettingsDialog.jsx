import {
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  FormControl,
  Paper,
  MenuItem,
  ButtonGroup,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import React, { useState, useMemo, useCallback, memo } from 'react';

import CustomDialog from './CustomDialog.jsx';
import {
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  exitRoom,
  selectRoom,
  selectMe,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

export const PRIVACY_ENUM = [
  {
    label: 'Private',
    description: '',
    value: 'private',
  },
  // {
  //   label: "Team",
  //   description: "",
  //   value: "team"
  // },
  // {
  //   label: "Department",
  //   description: "",
  //   value: "department"
  // },
  {
    label: 'Account',
    description: '',
    value: 'account',
  },
  {
    label: 'Public',
    description: '',
    value: 'public',
  },
];
export const MEMBER_ROLES = [
  {
    label: 'Owner',
    description: '',
    value: 'owner',
  },
  {
    label: 'Admin',
    description: '',
    value: 'admin',
  },
  {
    label: 'Member',
    description: '',
    value: 'member',
  },
  {
    label: 'Listener',
    description: '',
    value: 'listener',
  },
  {
    label: 'Viewer',
    description: '',
    value: 'viewer',
  },
];
export const AGENT_INTERACTION_ENUM = [
  {
    label: 'Mention Only',
    description: '',
    value: 'mention_only',
  },
  {
    label: 'Always when only one human connected',
    description: '',
    value: 'agents_only',
  },
  {
    label: 'Always',
    description: '',
    value: 'always',
  },
];

export const roomDetailsFields = [
  {
    title: 'Name',
    icon: '',
    description: 'Public name for the Room.',
    key: 'name',
  },
  {
    title: 'Description',
    icon: '',
    description: 'Set up an optional description for the Room.',
    key: 'description',
  },
];

export const roomPolicyFields = [
  {
    title: 'Privacy',
    icon: '',
    description: 'Define who should have access to the Room.',
    key: 'policy.privacy',
    options: PRIVACY_ENUM,
  },

  // {
  //     title: "Max members",
  //     description: "Set the maximum amoun of members of the room (-1 for unlimited)",
  //     icon: "",
  //     key: "policy.max_members"
  // },
  {
    title: 'Agent Interaction',
    description: 'Define when the AIgent should engage in the Room.',
    icon: '',
    key: 'policy.agent_interaction',
    options: AGENT_INTERACTION_ENUM,
  },
  {
    title: 'AIgent Timeout',
    description: 'Set the minimum time between AIgent interactions in the same Thread.',
    icon: '',
    key: 'policy.agent_timeout',
  },
  {
    title: 'Default Role',
    icon: '',
    description: 'Define the default role for any new Room Member invited to the Room.',
    key: 'policy.default_role',
    options: MEMBER_ROLES,
  },
];

const SettingsDialog = () => {
  const room = useSelector(selectRoom);
  const me = useSelector(selectMe);
  const isViewer = useMemo(
    () => me?.role && ['viewer', 'listener'].includes(me.role),
    [me],
  );
  const isAdmin = useMemo(
    () => me?.role && ['admin', 'owner'].includes(me.role),
    [me],
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // include new boolean flags
  const [formState, setFormState] = useState({
    name: room?.name || '',
    description: room?.description || '',
    'policy.privacy': room?.policy?.privacy || 'public',
    'policy.default_role': room?.policy?.default_role || 'member',
    'policy.max_members': room?.policy?.max_members ?? -1,
    'policy.agent_interaction': room?.policy?.agent_interaction || 'mention_only',
    'policy.memory_enabled': room?.policy?.memory_enabled ?? true,
    'policy.cagi_enabled': room?.policy?.cagi_enabled ?? false,
    'policy.agent_timeout': room?.policy?.agent_timeout ?? 1,
    'policy.requirements': room?.policy?.requirements?.data || [],
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = useCallback((key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    const [name, description, privacy, default_role, max_members, agent_interaction,
      memory_enabled, cagi_enabled, agent_timeout, requirements,
    ] = [
      formState.name,
      formState.description,
      formState['policy.privacy'],
      formState['policy.default_role'],
      parseInt(formState['policy.max_members'], 10),
      formState['policy.agent_interaction'],
      formState['policy.memory_enabled'],
      formState['policy.cagi_enabled'],
      parseFloat(formState['policy.agent_timeout']),
      formState['policy.requirements'],
    ];

    const payload = {
      name,
      description,
      policy: { privacy, default_role, agent_interaction, memory_enabled, cagi_enabled, max_members, agent_timeout, requirements: { data: requirements } },
    };

    dispatch(updateRoom(payload))
      .catch((err) => console.error('Update failed', err))
      .finally(() => {
        setLoading(false);
        setDialogOpen(false);
      });
  }, [formState, avatarFile]);

  const actionHandler = useCallback((action) => {
    setLoading(true);
    dispatch(action())
      .then(() => window.location.reload())
      .catch((err) => console.error('Action failed', err));
  }, []);

  if (!room) return null;

  return (
    <>
      <span
        onClick={() => setDialogOpen(true)}
        className="text-lg tracking-wide truncate hover:opacity-80 cursor-pointer"
      >
        {room.name}
      </span>

      <CustomDialog
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="settings-dialog"
        className="relative max-h-[90vh] overflow-y-auto"
      >
        <Stack
          spacing={2}
          padding={3}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Room Settings</Typography>
            <IconButton
              size="small"
              onClick={() => setDialogOpen(false)}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>

          {!isViewer && (
            <>
              {/* <UploadAvatar
                accept={{ 'image/*': [] }}
                file={avatarSrc}
                onDrop={handleDrop}
              /> */}

              <FormControl fullWidth>
                <Paper
                  sx={{
                    background: 'none',
                    border: (t) => `dashed 1px ${t.palette.divider}`,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Stack spacing={2}>
                    {roomDetailsFields.map(({ key, title, description, options }) => (
                      <TextField
                        key={key}
                        name={key}
                        label={title}
                        helperText={description}
                        select={!!options}
                        variant="filled"
                        size="small"
                        value={formState[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      >
                        {options?.map(({ value, label }) => (
                          <MenuItem
                            key={value}
                            value={value}
                          >
                            {label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ))}
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    background: 'none',
                    border: (t) => `dashed 1px ${t.palette.divider}`,
                    p: 2,
                  }}
                >
                  <Stack spacing={2}>
                    {roomPolicyFields.map(({ key, title, description, options }) => (
                      <TextField
                        key={key}
                        name={key}
                        label={title}
                        helperText={description}
                        select={!!options}
                        variant="filled"
                        size="small"
                        value={formState[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      >
                        {options?.map(({ value, label }) => (
                          <MenuItem
                            key={value}
                            value={value}
                          >
                            {label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ))}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formState['policy.memory_enabled']}
                          onChange={(e) => handleChange('policy.memory_enabled', e.target.checked)}
                        />
                      }
                      label="Enable memory"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formState['policy.cagi_enabled']}
                          onChange={(e) => handleChange('policy.cagi_enabled', e.target.checked)}
                        />
                      }
                      label="Enable CAGI"
                    />
                  </Stack>
                </Paper>

                <Button
                  variant="soft"
                  fullWidth
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save
                </Button>

                <Divider
                  sx={{
                    my: 3,
                    typography: 'overline',
                    color: 'text.disabled',
                    '&::before, &::after': { borderTopStyle: 'dashed' },
                  }}
                >
                  OR
                </Divider>
              </FormControl>
            </>
          )}

          <Button
            variant="soft"
            color="error"
            fullWidth
            onClick={() => actionHandler(exitRoom)}
            disabled={loading}
            startIcon={<Iconify icon="solar:exit-bold-duotone" />}
          >
            Exit room
          </Button>

          {isAdmin && (
            <ButtonGroup fullWidth>
              <Button
                variant="soft"
                color="warning"
                onClick={() => actionHandler(() => updateRoomStatus('archived'))}
                disabled={loading}
                startIcon={<Iconify icon="entypo:archive" />}
              >
                Archive
              </Button>
              <Button
                variant="soft"
                color="error"
                onClick={() => actionHandler(deleteRoom)}
                disabled={loading}
                startIcon={<Iconify icon="mdi:trash" />}
              >
                Delete room
              </Button>
            </ButtonGroup>
          )}
        </Stack>
      </CustomDialog>
    </>
  );
};

export default memo(SettingsDialog);
