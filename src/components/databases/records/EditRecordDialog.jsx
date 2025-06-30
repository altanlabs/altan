/* eslint-disable react-hooks/rules-of-hooks */
import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import { useState, useCallback, memo, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { updateTableRecordThunk } from '../../../redux/slices/bases';
import { createRoom } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';
import { optimai_room } from '../../../utils/axios.js';
import formatData from '../../../utils/formatData';
import CustomDialog from '../../dialogs/CustomDialog.jsx';
import Iconify from '../../iconify';
import Room from '../../Room';
import FormParameter from '../../tools/form/FormParameter';
import CreateFieldDialog from '../fields/CreateFieldDialog';

const getSchemaType = (fieldType) => {
  switch (fieldType) {
    case 'number':
    case 'rating':
      return 'number';
    case 'checkbox':
      return 'boolean';
    case 'date':
      return 'string';
    case 'reference':
      return 'array';
    default:
      return 'string';
  }
};

const EditRecordDialog = ({ baseId, tableId, recordId, open, onClose }) => {
  const methods = useForm({ defaultValues: {} });
  const location = useLocation();
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;
  const [roomId, setRoomId] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);
  const account = useSelector((state) => state.general.account);
  const externalId = useMemo(() => `${baseId}_${tableId}_${recordId}`, [baseId, tableId, recordId]);

  const table = useSelector(
    useMemo(
      () => (state) =>
        state.bases?.bases?.[baseId]?.tables?.items?.find((t) => t?.id === tableId) ?? null,
      [baseId, tableId],
    ),
  );

  const fields = useMemo(() => table?.fields?.items ?? [], [table]);
  const record = useSelector(
    useMemo(
      () => (state) =>
        state.bases?.records?.[tableId]?.items?.find((r) => r?.id === recordId) ?? null,
      [tableId, recordId],
    ),
  );

  if (!tableId || !recordId || !baseId || recordId == null) return null;

  useEffect(() => {
    if (record) reset(record);
  }, [record, reset]);

  const recordSchema = useMemo(
    () => ({
      type: 'object',
      properties: fields.reduce((acc, field) => {
        if (!field?.name) return acc;
        acc[field.name.toLowerCase()] = {
          type: getSchemaType(field.type ?? 'string'),
          description: field.name,
          'x-field-type': field.type ?? 'string',
          'x-field-options': field.options ?? {},
        };
        return acc;
      }, {}),
      required: fields.filter((f) => f?.is_required && f?.name).map((f) => f.name.toLowerCase()),
    }),
    [fields],
  );

  const onSubmit = useCallback(
    (data) => {
      if (!tableId || !recordId) return;
      dispatch(
        updateTableRecordThunk(tableId, recordId, formatData(data, recordSchema.properties)),
      );
      onClose?.();
    },
    [tableId, recordId, onClose, recordSchema],
  );

  const handleCreateFieldOpen = () => setIsCreateFieldOpen(true);
  const handleCreateFieldClose = () => setIsCreateFieldOpen(false);

  const handleShare = useCallback(() => {
    if (location?.pathname) {
      const currentUrl = window.location.origin + location.pathname;
      navigator.clipboard.writeText(currentUrl).catch(() => {});
    }
  }, [location]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRoom = async () => {
      try {
        const response = await optimai_room.get(
          `/external/${externalId}?account_id=${account?.id}`,
          {
            signal: controller.signal,
          },
        );
        setRoomId(response.data.room.id);
      } catch {
        if (!controller.signal.aborted) setRoomId(null);
      } finally {
        setIsLoadingRoom(false);
      }
    };
    setIsLoadingRoom(true);
    if (externalId && account?.id) fetchRoom();
    else {
      setRoomId(null);
      setIsLoadingRoom(false);
    }
    return () => controller.abort();
  }, [externalId, account?.id]);

  const handleCreateRoom = useCallback(() => {
    const roomName = record?.employee_name || `Room for record ${recordId}`;
    dispatch(
      createRoom({
        name: roomName,
        external_id: externalId,
      }),
    )
      .then((room) => {
        if (room?.id) setRoomId(room.id);
      })
      .catch(() => {});
  }, [record, recordId, externalId]);

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Box
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            width: '100%',
            zIndex: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ ml: 2 }}
            >
              {record?.name || 'Record Details'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LoadingButton
              variant="contained"
              startIcon={<Iconify icon="mdi:check" />}
              onClick={handleSubmit(onSubmit)}
              loading={false}
              disabled={!isDirty}
              size="small"
            >
              Save
            </LoadingButton>
            <Tooltip title="Copy record url">
              <IconButton onClick={handleShare}>
                <Iconify icon="mdi:share" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FormProvider {...methods}>
              <Stack
                padding={2}
                spacing={1}
                sx={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 70px)' }}
              >
                {Object.entries(recordSchema.properties).map(([key, fieldSchema]) => (
                  <FormParameter
                    key={key}
                    fieldKey={key}
                    schema={fieldSchema}
                    required={recordSchema.required.includes(key)}
                    enableLexical={false}
                  />
                ))}
                <Button onClick={handleCreateFieldOpen}>+ Add new field to this table</Button>
              </Stack>
            </FormProvider>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
          />
          <Box
            sx={{
              width: roomId ? 450 : 300,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 70px)',
              overflow: 'hidden',
              borderLeft: '1px solid',
              borderColor: 'divider',
              transition: 'width 0.3s ease',
            }}
          >
            {isLoadingRoom ? (
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography>Loading room...</Typography>
              </Box>
            ) : roomId ? (
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Room
                  roomId={roomId}
                  header={false}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 2,
                  height: '100%',
                }}
              >
                <Iconify
                  icon="mdi:chat-outline"
                  width={40}
                  height={40}
                  sx={{ opacity: 0.5 }}
                />
                <Typography variant="h6">Start a conversation</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Ask questions, keep track of status updates, and collaborate with your team —
                  directly in Altan.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:plus" />}
                  sx={{ mt: 2 }}
                  onClick={handleCreateRoom}
                >
                  Create room
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        {table && (
          <CreateFieldDialog
            table={table}
            open={isCreateFieldOpen}
            onClose={handleCreateFieldClose}
          />
        )}
      </Box>
    </CustomDialog>
  );
};

export default memo(EditRecordDialog);
