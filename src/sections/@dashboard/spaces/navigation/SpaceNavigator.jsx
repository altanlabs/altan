import {
  Stack,
  Typography,
  Button,
  IconButton,
  List,
  ListItemButton,
  Checkbox,
  Drawer,
  Divider,
} from '@mui/material';
import { memo, useState, useMemo, useEffect, useCallback } from 'react';

import Iconify from '../../../../components/iconify/Iconify';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import { useSnackbar } from '../../../../components/snackbar';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import useResponsive from '../../../../hooks/useResponsive';
import {
  createSpaceLink,
  getRootSpaces,
  getSpace,
  moveSpace,
  setNavigationHidden,
} from '../../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../../redux/store';

const SpaceNavigator = ({ linkUserSpaces, setSpace }) => {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { current, spaces, navigation } = useSelector((state) => state.spaces);
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const isMobile = useResponsive('down', 'sm');

  useEffect(() => {
    if (!!navigation.active && !('root' in spaces)) dispatch(getRootSpaces('navigate'));
  }, [navigation.active]);

  const checkSelectedChildren = useCallback(
    (spaceId) => {
      const space = spaces[spaceId];
      let childrenSelected = [];
      if (!space) return [];

      space?.children?.items.forEach((child) => {
        if (selectedSpaces.includes(child.id)) childrenSelected.push(child.id);
        else childrenSelected = [...childrenSelected, ...checkSelectedChildren(child.id)];
      });

      return childrenSelected;
    },
    [selectedSpaces, spaces],
  );

  const handleToggle = useCallback(
    (space, childrenSelected) => {
      const spaceData = { id: space.id, name: space.name };

      if (!!childrenSelected.length) {
        setSelectedSpaces((prev) => prev.filter((item) => !childrenSelected.includes(item.id)));
      }

      if (selectedSpaces.find((item) => item.id === space.id)) {
        setSelectedSpaces((prev) => prev.filter((item) => item.id !== space.id));
      } else {
        if (navigation.mode === 'gate') {
          // Allow only one selection in 'gate' mode
          setSelectedSpaces([spaceData]);
        } else {
          setSelectedSpaces((prev) => [...prev, spaceData]);
        }
      }
    },
    [selectedSpaces, navigation.mode, setSelectedSpaces],
  );

  const handleCreateLinks = useCallback(() => {
    const options = {
      successMessage: 'Link successfully created!',
      errorMessage: 'Error creating link: ',
      useSnackbar: true,
      useConsole: false,
    };
    selectedSpaces.forEach((space) => dispatchWithFeedback(createSpaceLink(space), options));
    setSelectedSpaces([]);
    dispatch(setNavigationHidden());
  }, [selectedSpaces, setSelectedSpaces]);

  const handleSelectSpace = useCallback(
    (id) =>
      dispatchWithFeedback(id === 'root' ? getRootSpaces('navigate') : getSpace(id, 'navigate'), {
        errorMessage: 'Error while fetching space: ',
        useSnackbar: {
          error: true,
          success: false,
        },
      }),
    [dispatchWithFeedback],
  );

  const handleMoveSpace = useCallback(() => {
    const options = {
      successMessage: `Space ${navigation.origin?.name} successfully moved to ${spaces[selectedSpaces[0]].name}`,
      errorMessage: `Error moving space ${navigation.origin?.name}: `,
      useSnackbar: true,
      useConsole: false,
    };
    dispatchWithFeedback(moveSpace(navigation.origin?.id, selectedSpaces[0]), options).then(() => {
      dispatch(setNavigationHidden());
      setSelectedSpaces([]);
    });
  }, [navigation.origin, selectedSpaces, setSelectedSpaces]);

  const handleGateSpace = () => {
    if (selectedSpaces.length > 0) {
      setSpace(selectedSpaces[0]); // selectedSpaces[0] now has both id and name
      enqueueSnackbar(`Space ${selectedSpaces[0].name} successfully linked to gate`);
    } else {
      enqueueSnackbar('No space selected', { variant: 'error' });
    }
    dispatch(setNavigationHidden());
    setSelectedSpaces([]);
  };

  const onClick = () => {
    if (navigation.mode === 'links') handleCreateLinks();
    else if (navigation.mode === 'move') handleMoveSpace();
    else if (navigation.mode === 'user') linkUserSpaces(selectedSpaces);
    else if (navigation.mode === 'gate') handleGateSpace();
    dispatch(setNavigationHidden());
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}
    >
      <Typography
        variant="h6"
        sx={{ flexGrow: 1 }}
      >
        Space navigation{navigation.mode === 'move' && ` (Moving ${navigation.origin?.name})`}
      </Typography>
      {!!isMobile && (
        <IconButton onClick={() => dispatch(setNavigationHidden())}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderList = useMemo(
    () => (
      <Scrollbar>
        <List disablePadding>
          {spaces[navigation.current]?.children?.items?.map((space) => {
            const selChildren = checkSelectedChildren(space.id);
            const linksDisabled =
              navigation.mode === 'links' &&
              (!spaces[navigation.current].id ||
                spaces[navigation.current].id === current.id ||
                !!current?.children?.items
                  .filter((sp) => sp.type === 'link')
                  .map((sp) => sp.child.reference.id)
                  .includes(space.id));
            const moveDisabled =
              navigation.mode === 'move' &&
              ((selectedSpaces.length === 1 && !selectedSpaces.includes(space.id)) ||
                navigation.origin?.id === space.id ||
                navigation.origin?.parent_id === space.id);
            const isChecked = selectedSpaces.some((s) => s.id === space.id);

            return (
              <Stack
                direction="row"
                key={`navigation_space_child_${space.id}`}
              >
                <Checkbox
                  onClick={() => handleToggle(space, selChildren)}
                  checked={isChecked}
                  indeterminate={!!selChildren.length}
                  disabled={linksDisabled || moveDisabled}
                />
                <ListItemButton onClick={() => handleSelectSpace(space.id)}>
                  {space.name}
                </ListItemButton>
              </Stack>
            );
          })}
        </List>
      </Scrollbar>
    ),
    [spaces, navigation.current, selectedSpaces],
  );

  const renderBreadcrumbs = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="left"
      sx={{ pr: 1 }}
    >
      <>
        <Button
          color="inherit"
          size="large"
          variant="text"
          onClick={() => handleSelectSpace('root')}
        >
          <Iconify
            icon="mdi:house-outline"
            width={18}
            sx={{ mr: 0.75 }}
          />
          Root
        </Button>
        {(navigation.current === 'root' || !spaces[navigation.current]?.parent_id) && (
          <Iconify
            icon="ooui:next-rtl"
            width={14}
            rotate={2}
          />
        )}
        {navigation.current !== 'root' && !!spaces[navigation.current]?.parent_id && (
          <IconButton
            children={
              <Iconify
                icon="pepicons-pop:dots-x"
                width={16}
                rotate={2}
              />
            }
            onClick={() => handleSelectSpace(spaces[navigation.current]?.parent_id)}
          />
        )}
        {navigation.current !== 'root' && (
          <Button
            color="inherit"
            size="large"
            variant="text"
          >
            {spaces[navigation.current]?.name}
          </Button>
        )}
      </>
    </Stack>
  );

  return (
    <Drawer
      open={navigation.active}
      onClose={() => dispatch(setNavigationHidden())}
      anchor="right"
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: { width: 1, maxWidth: 420, pb: 4 },
      }}
    >
      {renderHead}

      <Divider />
      {!!navigation.current && renderBreadcrumbs}

      <Divider />

      {renderList}
      <Stack
        direction="row"
        justifyContent="center"
      >
        <Button
          variant="outlined"
          color="inherit"
          startIcon={
            <Iconify
              icon={navigation.mode === 'move' ? 'material-symbols:move-item' : 'uil:link-add'}
            />
          }
          onClick={onClick}
          sx={{ width: 200 }}
          disabled={!selectedSpaces.length}
        >
          {navigation.mode === 'links' && `Create ${selectedSpaces.length} links`}
          {navigation.mode === 'move' && 'Move here'}
          {navigation.mode === 'user' && 'Assign spaces'}
          {navigation.mode === 'gate' && 'Link space to gate'}
        </Button>
      </Stack>
    </Drawer>
  );
};

export default memo(SpaceNavigator);
