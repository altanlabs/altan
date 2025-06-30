import {
  IconButton,
  Toolbar,
  Button,
  Stack,
  Popover,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import InfoModal from '../../../../components/helpers/InfoModal';
import Iconify from '../../../../components/iconify/Iconify';
import { setDialogActive } from '../../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../../redux/store';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import { RenameDialog, TranslationsDialog } from '../Dialogs';

const LastBreadcrumbMenu = ({ id, anchorEl, setAnchorEl, space }) => {
  const [dialogsOpen, setDialogsOpen] = useState({});

  const buttonsList = [
    {
      id: 'rename',
      label: 'Rename',
      icon: 'mdi:rename',
      action: () =>
        setDialogsOpen((prev) => {
          const diag = { ...prev };
          diag.rename = true;
          return diag;
        }),
    },
    {
      id: 'translations',
      label: 'Translations',
      icon: 'bi:translate',
      action: () =>
        setDialogsOpen((prev) => {
          const diag = { ...prev };
          diag.translations = true;
          return diag;
        }),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'ion:duplicate',
      disabled: true,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'mdi:trash',
      color: 'error',
      action: () => dispatch(setDialogActive({ item: { id, type: 'space' }, dialog: 'delete' })),
    },
  ];

  return (
    <>
      <RenameDialog
        isOpen={!!dialogsOpen['rename']}
        onClose={() => setDialogsOpen((prev) => (prev['rename'] = false))}
        space={space}
      />
      <TranslationsDialog
        isOpen={!!dialogsOpen['translations']}
        onClose={() => setDialogsOpen((prev) => (prev['translations'] = false))}
        space={space}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            {buttonsList.map((item, i) => (
              <Button
                key={`menu_last_space_button_${id}_${i}`}
                disabled={item.disabled}
                color={item.color || 'inherit'}
                fullWidth
                startIcon={<Iconify icon={item.icon} />}
                sx={{
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

const SpaceBreadcrumb = ({ space, size, i, breadcrumbsLength, previousBreadcrumb, navigate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isRoot = space.id === 'root';
  const isLast = i === breadcrumbsLength - 1;
  const isFirst = i === 0;
  const hasParent = !!space.parent_id;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {!isRoot && isFirst && hasParent && (
        <IconButton
          children={
            <Iconify
              icon="pepicons-pop:dots-x"
              width={16}
              rotate={2}
            />
          }
          onClick={() => navigate(PATH_DASHBOARD.spaces.view(space.parent_id))}
          disabled={!space.parent_id}
        />
      )}
      {!isRoot &&
        !(isFirst && hasParent) &&
        ((!hasParent && previousBreadcrumb === 'root') ||
          (!!hasParent && space.parent_id === previousBreadcrumb)) && (
        <Iconify
          icon="ooui:next-rtl"
          width={14}
          rotate={2}
        />
      )}
      {!isRoot &&
        !!(
          !isFirst &&
          ((hasParent && space.parent_id !== previousBreadcrumb) ||
            (!hasParent && previousBreadcrumb !== 'root'))
        ) && (
        <Iconify
          icon="uil:link"
          width={14}
          rotate={2}
        />
      )}
      {!!isRoot || !isLast ? (
        <Button
          color="inherit"
          size={size}
          variant="text"
          onClick={() => navigate(PATH_DASHBOARD.spaces.view(space.id))}
          sx={{ textTransform: 'none' }}
        >
          {space.id === 'root' && (
            <Iconify
              icon="gridicons:layout"
              sx={{ mr: 0.75 }}
            />
          )}
          {space.id === 'root' ? 'Spaces' : space.name}
        </Button>
      ) : (
        <>
          <LastBreadcrumbMenu
            id={space.id}
            setAnchorEl={setAnchorEl}
            anchorEl={anchorEl}
            space={space}
          />
          <Button
            color="inherit"
            size={size}
            variant="text"
            endIcon={
              <Iconify
                width={10}
                icon="ph:triangle-fill"
                rotate={2}
              />
            }
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              textTransform: 'none',
              ...(size === 'small' && {
                maxWidth: 130,
              }),
            }}
          >
            <Typography
              fontSize="inherit"
              fontWeight="inherit"
              noWrap
            >
              {space.name}
            </Typography>
          </Button>
        </>
      )}
    </div>
  );
};

function SpaceToolbar({
  isViewActive,
  setIsViewActive,
  isEditLayout,
  changesLayout,
  onEditLayout,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  const { breadcrumbs: stateBreadcrumbs, spaces, current } = useSelector((state) => state.spaces);
  const size = isMobile ? 'small' : isTablet ? 'medium' : 'large';
  const breadcrumbs = isMobile
    ? stateBreadcrumbs.slice(-1)
    : isTablet
      ? stateBreadcrumbs.slice(-2)
      : isDesktop
        ? stateBreadcrumbs.slice(-4)
        : stateBreadcrumbs;
  const breadcrumbsLength = breadcrumbs.length;

  const renderRoot = useMemo(() => {
    const firstBreadcrumb = !breadcrumbs.length ? current : spaces[breadcrumbs[0]];
    let name = 'Spaces',
      path = PATH_DASHBOARD.spaces.view('root'),
      icon = (
        <Iconify
          icon="mdi:house-outline"
          width={18}
          sx={{ mr: 0.75 }}
        />
      );
    if (firstBreadcrumb?.creator?.member_type === 'agent') {
      name = firstBreadcrumb.creator.agent.name || 'Agent';
      path = PATH_DASHBOARD.members.view(firstBreadcrumb.creator.agent_id);
      const avatarUrl = firstBreadcrumb.creator.agent.avatar_url;
      if (!!avatarUrl) {
        icon = (
          <img
            style={{ borderRadius: '50%', width: 25, height: 25 }}
            src={avatarUrl}
          />
        );
      }
    }

    return (
      !!current &&
      !breadcrumbs.includes('root') && (
        <>
          <Button
            color="inherit"
            size={size}
            variant="text"
            onClick={() => navigate(path)}
            startIcon={icon}
          >
            {name}
          </Button>
          {!!breadcrumbsLength && !spaces[breadcrumbs[0]].parent_id && (
            <Iconify
              icon="ooui:next-rtl"
              width={14}
              rotate={2}
            />
          )}
        </>
      )
    );
  }, []);

  return (
    <>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
        >
          {renderRoot}
          {breadcrumbs.map((spaceId, i) => (
            <SpaceBreadcrumb
              key={`space_button_${spaceId}`}
              i={i}
              space={spaces[spaceId]}
              previousBreadcrumb={!!i && breadcrumbs[i - 1]}
              breadcrumbsLength={breadcrumbsLength}
              navigate={navigate}
              size={size}
            />
          ))}
        </Stack>
        {!!current?.id && current.id !== 'root' && (
          <Stack
            direction="row"
            spacing={1}
          >
            {isMobile ? (
              <IconButton
                variant="soft"
                color={isEditLayout ? 'success' : 'info'}
                onClick={onEditLayout}
                children={
                  <Iconify icon={isEditLayout ? 'teenyicons:tick-circle-solid' : 'gg:reorder'} />
                }
              />
            ) : (
              <Button
                variant="soft"
                color={isEditLayout ? 'success' : 'info'}
                startIcon={
                  <Iconify icon={isEditLayout ? 'teenyicons:tick-circle-solid' : 'gg:reorder'} />
                }
                onClick={onEditLayout}
              >
                {isEditLayout ? 'Save' : 'Reorder'}
              </Button>
            )}
            {isEditLayout && changesLayout && (
              <IconButton
                variant="soft"
                color="secondary"
                onClick={onEditLayout}
                children={
                  <Iconify icon={'line-md:circle-twotone-to-confirm-circle-twotone-transition'} />
                }
              />
            )}
            {isMobile ? (
              <IconButton
                variant="soft"
                color="secondary"
                onClick={() => setIsViewActive((prev) => !prev)}
                children={<Iconify icon={`carbon:view${!!isViewActive ? '-off' : ''}`} />}
              />
            ) : (
              <Button
                variant="soft"
                color="secondary"
                startIcon={<Iconify icon={`carbon:view${!!isViewActive ? '-off' : ''}`} />}
                onClick={() => setIsViewActive((prev) => !prev)}
              >
                {!isViewActive ? 'Preview' : 'Hide'}
              </Button>
            )}
            <InfoModal
              videoUrl="https://youtu.be/XwsMtk3zts4"
              description="Dive into categories with the breadcrumb trail and easily navigate back. Within each space, you can shape your bot's conversations using widgets and branch out with child spaces. Check your design come to life with the real-time preview on the right. Need adjustments? Use 'Reorder' and 'Hide' for that perfect flow. By modularizing information here, you ensure your bot delivers precise and relevant responses every time. Craft a seamless experience, one space at a time."
            />
          </Stack>
        )}
      </Toolbar>
    </>
  );
}

export default SpaceToolbar;
