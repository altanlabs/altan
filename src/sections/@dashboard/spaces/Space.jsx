import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Stack, Box, Paper, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Drawer } from '@mui/material';
import { AnimatePresence, m } from 'framer-motion';
import React, { useState, useEffect, useCallback, useMemo, lazy, memo } from 'react';

import useFeedbackDispatch from '@hooks/useFeedbackDispatch';

import { DeleteDialog, SettingsDialog } from './Dialogs';
import AddSpaceMenu from './menus/AddSpaceMenu';
import SpaceNavigator from './navigation/SpaceNavigator';
import ToolNavigator from './navigation/ToolNavigator';
import { SpaceCard, SpaceToolCard } from './StyledCards';
import ActionTypeCard from './tools/ActionTypeCard';
import ClientToolDrawer from './tools/ClientToolDrawer';
import CustomTextField from '../../../components/custom-input/CustomTextField';
import InfoModal from '../../../components/helpers/InfoModal';
import Iconify from '../../../components/iconify';
import AltanLogo from '../../../components/loaders/AltanLogo';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import { bgBlur } from '../../../utils/cssStyles';
import { HEADER, NAV } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectAccount } from '../../../redux/slices/general';
import {
  createSpace,
  createSpaceRoot,
  deleteSpace,
  deleteSpaceLink,
  // getRootSpaces,
  getSpace,
  updateSpace,
} from '../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../redux/store';
import { PATH_DASHBOARD } from '../../../routes/paths';
import Each from '../../../utils/each';

// const Widgets = lazy(() => import('./Widgets'));
const SpaceToolbar = lazy(() => import('./toolbar/SpacesToolbar'));

const CREATE_OPTIONS = {
  successMessage: 'Space created successfully!',
  errorMessage: 'Error while creating space: ',
  useSnackbar: true,
};

const GET_OPTIONS = {
  successMessage: 'Fetch successful.',
  errorMessage: 'Error while fetching space: ',
  useSnackbar: {
    error: true,
    success: false,
  },
};

const Space = ({ navigate, spaceId, isPreview }) => {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const { themeLayout } = useSettingsContext();
  const isNavMini = themeLayout === 'mini';
  const isDesktop = useResponsive('up', 'lg');
  const top = HEADER.H_MOBILE;
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedClientTool, setSelectedClientTool] = useState(null);
  const [isViewActive, setIsViewActive] = useState(false);
  const [newSpace, setNewSpace] = useState(null);
  const [toolDrawer, setToolDrawer] = useState(false);
  const [clientToolDrawer, setClientToolDrawer] = useState(false);
  const [editingSpaceCards, setEditingSpaceCards] = useState([]);
  const [toolMenuAnchor, setToolMenuAnchor] = useState(null);
  const [spaceChildrenCopy, setSpaceChildrenCopy] = useState([]);
  const [changes, setChanges] = useState(false);
  const [isEditLayout, setIsEditLayout] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const current = useSelector((state) => state.spaces.current);
  const account = useSelector(selectAccount);
  const user = useSelector((state) => state.general.user);
  const { enqueueSnackbar } = useSnackbar();

  const onCloseEditTool = useCallback(() => {
    setSelectedTool(null);
  }, []);

  const onCloseEditClientTool = useCallback(() => {
    setSelectedClientTool(null);
    setClientToolDrawer(false);
  }, []);

  const handleToolEdit = useCallback((toolItem) => {
    const isClientTool = toolItem.tool?.tool_type === 'client';

    if (isClientTool) {
      setSelectedClientTool(toolItem);
      setClientToolDrawer(true);
    } else {
      setSelectedTool(toolItem);
    }
  }, []);

  const createNewSpace = useCallback(() => {
    setNewSpace({ type: 'space', child: { id: 'new', name: '' } });
    setEditingSpaceCards((prev) => [...prev, 'new']);
  }, [setNewSpace, setEditingSpaceCards]);

  const createPersonalSpace = useCallback(() => {
    dispatchWithFeedback(
      createSpaceRoot({
        name: `${user?.first_name || user?.first_name || 'User'}'s Personal Space`,
        is_personal: true,
      }),
      CREATE_OPTIONS,
    );
  }, [dispatchWithFeedback, user?.first_name]);

  const handleDeleteSpace = useCallback(
    (id) => {
      if (id === 'new') setNewSpace(null);
      else dispatch(deleteSpace(id));
      setEditingSpaceCards((eSpaceCards) => eSpaceCards.filter((itemId) => itemId !== id));
    },
    [setNewSpace, setEditingSpaceCards],
  );

  const handleDeleteLink = useCallback((id) => dispatch(deleteSpaceLink(id)), []);

  const handleToolMenuOpen = useCallback((event) => {
    setToolMenuAnchor(event.currentTarget);
  }, []);

  const handleToolMenuClose = useCallback(() => {
    setToolMenuAnchor(null);
  }, []);

  const handleServerTool = useCallback(() => {
    setToolDrawer(true);
    handleToolMenuClose();
  }, [handleToolMenuClose]);

    const handleClientTool = useCallback(() => {
    setSelectedClientTool(null);
    setClientToolDrawer(true);
    handleToolMenuClose();
  }, [handleToolMenuClose]);

  const handleEditMode = useCallback(
    (id, name, oldName) => {
      setEditingSpaceCards((spaceCards) => {
        if (spaceCards.includes(id)) {
          if (id === 'new') {
            dispatchWithFeedback(
              (current.id === 'root' ? createSpaceRoot : createSpace)({ name }),
              CREATE_OPTIONS,
            );
            setNewSpace(null);
          } else if (oldName !== name)
            dispatchWithFeedback(updateSpace(id, name), {
              errorMessage: 'Error updating space: ',
              useSnackbar: { error: true },
            });
          return spaceCards.filter((itemId) => itemId !== id);
        }
        return [...spaceCards, id];
      });
    },
    [current?.id, dispatchWithFeedback],
  );

  const personalSpaces = useMemo(
    () =>
      (current?.id === 'root' &&
        current?.children?.items
          ?.filter((s) => !!s.is_personal)
          .map((s) => ({ type: 'space', child: s }))) ??
      [],
    [current?.children?.items, current?.id],
  );
  const personalSpace = useMemo(() => personalSpaces[0], [personalSpaces]);
  const sChildren = useMemo(
    () =>
      current?.children?.items
        ?.filter((s) => !s.is_personal || current.id !== 'root')
        .map((s) => ({ type: 'space', child: s })) ?? [],
    [current?.children?.items, current?.id],
  );
  const lChildren = useMemo(
    () => current?.links?.items?.map((l) => ({ type: 'link', child: l })) ?? [],
    [current?.links],
  );
  const childrenSpaces = useMemo(() => sChildren.concat(lChildren), [lChildren, sChildren]);
  // const childrenKnowledge = useMemo(() => (current?.id !== 'root' && current?.knowledge?.items) ?? [], [current?.knowledge]);
  const allSpaceChildren = useMemo(
    () => (!newSpace ? childrenSpaces : [...childrenSpaces, newSpace]),
    [childrenSpaces, newSpace],
  );

  const spaceChildrenCopyLength = spaceChildrenCopy.length;

  useEffect(() => {
    if (!!account?.id) {
      if (current?.id !== spaceId) {
        dispatchWithFeedback(getSpace(spaceId), GET_OPTIONS);
      }
    }
  }, [account?.id, spaceId, current]);

  useEffect(() => {
    setEditingSpaceCards([]);
    setNewSpace(null);
    if (
      !!account?.id &&
      !!current?.id &&
      current.id !== 'root' &&
      current.account_id !== account.id
    )
      navigate(PATH_DASHBOARD.spaces.root, { replace: true });
  }, [account?.id, current]);

  useEffect(() => {
    if (!isEditLayout && !!changes && spaceChildrenCopyLength) {
      console.log('DISPATCHING STORE SPACE CHILDREN NEW POSITIONS');
    }
    if (!isEditLayout) setChanges(false);
    setSpaceChildrenCopy(!isEditLayout ? [] : childrenSpaces);
  }, [isEditLayout]);

  const spaceChildrenToRender = !isEditLayout ? allSpaceChildren : spaceChildrenCopy;
  const filteredSpaces = useMemo(() => {
    if (!searchTerm) return spaceChildrenToRender;
    return spaceChildrenToRender.filter((space) =>
      space?.child.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [spaceChildrenToRender, searchTerm]);

  const handleSpaceDragEnd = useCallback((e) => {
    const { active, over } = e;
    if (active?.id !== over?.id) {
      setSpaceChildrenCopy((items) => {
        const oldIndex = items.findIndex((item) => item.child.id === active.id);
        const newIndex = items.findIndex((item) => item.child.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setChanges(true);
    }
  }, []);

  const sortableSpaces = useMemo(
    () => !!filteredSpaces?.length && filteredSpaces.map((item) => item?.child?.id).filter(Boolean),
    [filteredSpaces],
  );

  if (!current || (current.id !== 'root' && current.account_id !== account?.id))
    return <AltanLogo wrapped={true} />;

  const handleIsEditLayout = () => {
    setIsEditLayout((prev) => !prev);
  };

  return (
    <>
      {!!current?.id && current.id !== 'root' && (
        <>
          <ToolNavigator
            toolDrawer={toolDrawer}
            setToolDrawer={setToolDrawer}
            enqueueSnackbar={enqueueSnackbar}
          />
          <SpaceNavigator />
        </>
      )}
      <SettingsDialog />
      <DeleteDialog />
      <ClientToolDrawer
        open={clientToolDrawer}
        onClose={onCloseEditClientTool}
        toolToEdit={selectedClientTool}
      />
      <Box
        sx={
          isPreview
            ? undefined
            : {
                background: 'transparent',
                position: 'fixed',
                padding: 0,
                margin: 0,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 0,
                paddingTop: `${top}px`,
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'row',
                ...(isDesktop && {
                  width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
                  left: `${NAV.W_DASHBOARD}px`,
                  ...(isNavMini && {
                    width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
                    left: `${NAV.W_DASHBOARD_MINI}px`,
                  }),
                }),
              }
        }
      >
        <Stack
          direction="column"
          sx={{ height: '90%', width: '100%' }}
        >
          {!isPreview && (
            <SpaceToolbar
              isViewActive={isViewActive}
              setIsViewActive={setIsViewActive}
              isEditLayout={isEditLayout}
              onEditLayout={handleIsEditLayout}
            />
          )}
          <Stack
            direction="row"
            sx={{ height: '100%', width: '100%' }}
          >
            <Stack
              direction="column"
              spacing={1}
              sx={{ position: 'relative', height: '100%', width: '100%', overflowY: 'auto' }}
            >
              {current.id === 'root' && (
                <Paper
                  sx={{
                    background: 'none',
                    p: 1,
                    border: (theme) => `dashed 1px ${theme.palette.divider}`,
                  }}
                >
                  <InfoModal
                    title="Personal Space"
                    description={`Your personal space in ${account?.meta_data?.name || 'the account'}. You are the only one with access to it.`}
                  />
                  {!!personalSpace ? (
                    <SpaceCard
                      navigate={navigate}
                      item={personalSpace.child}
                      mode={personalSpace.type}
                    />
                  ) : (
                    <Paper
                      sx={{
                        background: 'none',
                        p: 1,
                        border: (theme) => `dashed 1px ${theme.palette.divider}`,
                      }}
                    >
                      <Button
                        variant="soft"
                        onClick={createPersonalSpace}
                        color="inherit"
                        startIcon={<Iconify icon="mdi:user" />}
                      >
                        Create Personal Space
                      </Button>
                    </Paper>
                  )}
                </Paper>
              )}

              {current.id !== 'root' && (
                <Box>
                  <div className="flex flex-row items-center gap-3">
                    <Button
                      color="inherit"
                      variant="soft"
                      onClick={handleServerTool}
                      fullWidth
                      startIcon={
                        <Iconify
                          icon="mdi:server"
                          width={15}
                        />
                      }
                    >
                      Add Server Tool
                    </Button>
                    <Button
                      color="inherit"
                      variant="soft"
                      onClick={handleClientTool}
                      fullWidth
                      startIcon={
                        <Iconify
                          icon="mdi:desktop-classic"
                          width={15}
                        />
                      }
                    >
                      Add Client Tool
                    </Button>
                  </div>
                  <div className="flex flex-col space-y-1 py-2 px-1">
                    {current.id !== 'root' && (
                      <Each
                        of={current.tools.items}
                        render={(tool, index) => (
                          <SpaceToolCard
                            key={`space_tool_${tool.id}_${index}`}
                            item={tool}
                            onEdit={handleToolEdit}
                            spaceId={current.id}
                          />
                        )}
                      />
                    )}
                  </div>
                  <Drawer
                    open={Boolean(selectedTool)}
                    onClose={onCloseEditTool}
                    anchor="right"
                    PaperProps={{
                      sx: {
                        width: 1,
                        maxWidth: 600,
                        backgroundColor: 'transparent',
                        padding: 1,
                        pb: 2,
                        ...bgBlur({ opacity: 0.1 }),
                      },
                    }}
                    slotProps={{
                      backdrop: { invisible: true },
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                      }}
                    >
                      {!!selectedTool?.tool && (
                        <ActionTypeCard
                          action={selectedTool.tool.action_type}
                          tool={selectedTool.tool}
                          onSave={onCloseEditTool}
                        />
                      )}
                    </Box>
                  </Drawer>
                </Box>
              )}

              {/* {current.id !== 'root' && (
                <Paper sx={{
                  background: 'none', p: 1,
                  border: (theme) => `dashed 1px ${theme.palette.divider}`,
                }}>
                  <InfoModal title="Knowledge" description="Bot's Brain: Add and view specific information, FAQs or product manual. This knowledge guides the bot in providing relevant responses when users ask questions in the associated space. When asked a question, the AI references both the current space and its parent spaces for answers." />
                  <Stack direction="column" spacing={0.5}>
                    {
                      current.id !== 'root' && (
                        <Each of={childrenKnowledge} render={(item, index) =>
                          !!item?.knowledge?.file && (
                            <KnowledgeCard key={`knowledge_card_${item.id}`} item={item} />
                          )
                        } />
                      )
                    }
                    {
                      current.id !== 'root' && (
                        <Each of={current.resources.items} render={(item, index) =>
                          <DataSourceCard key={`data_source_${item.id}`} item={item} />
                        } />
                      )
                    }
                  </Stack>
                  <Box>
                    <Button
                      color="inherit"
                      onClick={() => setKnowledgeDrawer(true)}
                      fullWidth
                      startIcon={<Iconify icon="ph:files-fill" />}
                    >
                      Add Knowledge
                    </Button>
                  </Box>
                </Paper>
              )} */}

              {!isPreview && (
                <Paper
                  sx={{
                    background: 'none',
                    p: 1,
                    border: (theme) => `dashed 1px ${theme.palette.divider}`,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mb: 1 }}
                  >
                    <InfoModal
                      title={current.id !== 'root' ? 'Space Children' : 'Account Space'}
                      description="These represent specialized sub-topics or paths your users might take. Like a tree, the main chat can branch out to these child spaces based on user choices."
                    />
                    <CustomTextField
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Stack>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSpaceDragEnd}
                  >
                    <Stack
                      direction="column"
                      margin={0}
                      alignItems="center"
                      spacing={0.5}
                    >
                      <SortableContext
                        items={sortableSpaces}
                        strategy={verticalListSortingStrategy}
                      >
                        {
                          <Each
                            of={filteredSpaces}
                            render={(item) => {
                              const isLink = item.type === 'link';
                              return (
                                <div
                                  style={{ width: '100%' }}
                                  key={`${item?.type}_card_${item?.child?.id}`}
                                >
                                  <SpaceCard
                                    navigate={navigate}
                                    item={item.child}
                                    mode={item.type}
                                    isEditLayout={isEditLayout}
                                    onDelete={!isLink ? handleDeleteSpace : handleDeleteLink}
                                    onEdit={!isLink ? handleEditMode : null}
                                    cardEditing={
                                      !isLink ? editingSpaceCards.includes(item?.child?.id) : false
                                    }
                                    isSubmitting={item?.child?.id === spaceId && isSubmitting}
                                  />
                                </div>
                              );
                            }}
                          />
                        }
                      </SortableContext>
                    </Stack>
                  </DndContext>
                  {!editingSpaceCards?.length && (
                    <AddSpaceMenu
                      currentId={current?.id || spaceId}
                      createNewSpace={createNewSpace}
                    />
                  )}
                </Paper>
              )}
            </Stack>

            {/* {
              current.id !== 'root' && (
                <Box
                  id="space-preview"
                  sx={{
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pr: 2,
                    ...!isViewActive && {
                      display: 'none'
                    },
                    ...isTablet && {
                      position: 'absolute',
                      top: top + 60,
                      bottom: 10,
                      left: 0,
                      right: 0
                    }
                  }}
                >
                  {renderSpacePreview}
                </Box>
              )
            } */}
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default memo(Space);
