import { ChevronRightTwoTone } from '@mui/icons-material';
import { Divider, Drawer, Stack } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import React, { memo } from 'react';

import useResponsive from '../../hooks/useResponsive';
import Iconify from '../iconify';

const SubMenu = ({ item, executeAction }) => {
  const isSmallScreen = useResponsive('down', 'sm');
  const [subMenuOpen, setSubMenuOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const handleMouseEnter = (e) => {
    e.stopPropagation();
    setSubMenuOpen(true);
  };
  const handleMouseLeave = (e) => {
    e.stopPropagation();
    setSubMenuOpen(false);
  };

  const DrawerContent = (
    <Stack spacing={0}>
      {!!isSmallScreen && (
        <MenuItem onClick={(e) => handleMouseLeave(e)}>
          <Iconify icon="mdi:chevron-left" />
          <Typography
            variant="caption"
            sx={{ fontSize: '0.8em' }}
          >
            Back
          </Typography>
        </MenuItem>
      )}
      {item.children.map((child, index, array) => (
        <div key={index}>
          <MenuItem
            disabled={child.a === null}
            onClick={() => executeAction(child.a)}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: '0.8em' }}
            >
              {child.l}
            </Typography>
          </MenuItem>
          {index < array.length - 1 && <Divider style={{ margin: 0, padding: 0 }} />}
        </div>
      ))}
    </Stack>
  );

  return (
    <>
      <MenuItem
        ref={anchorRef}
        sx={{ opacity: subMenuOpen ? 0.6 : 1 }}
        onClick={!isSmallScreen ? null : (e) => handleMouseEnter(e)}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          width="100%"
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Iconify
              width={15}
              icon={item.i}
            />
            <Typography
              variant="caption"
              sx={{ fontSize: '0.8em' }}
            >
              {item.l}
            </Typography>
          </Stack>
          <ChevronRightTwoTone onMouseEnter={!isSmallScreen ? (e) => handleMouseEnter(e) : null} />
        </Stack>
      </MenuItem>
      {!isSmallScreen ? (
        <Menu
          anchorEl={anchorRef.current}
          open={subMenuOpen}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handleMouseLeave}
          MenuListProps={{ onMouseLeave: handleMouseLeave }}
          sx={{ zIndex: 99999 }}
        >
          {DrawerContent}
        </Menu>
      ) : (
        <Drawer
          anchor="bottom"
          open={subMenuOpen}
          onClose={handleMouseLeave}
          sx={{ zIndex: 99999 }}
        >
          {DrawerContent}
        </Drawer>
      )}
    </>
  );
};

export default memo(SubMenu);
