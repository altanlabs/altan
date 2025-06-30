import { IconButton, Tooltip, Stack, Menu, MenuItem } from '@mui/material';
import React, { useState, memo, useCallback, useMemo, Fragment } from 'react';

import useResponsive from '../../../hooks/useResponsive';
import Iconify from '../../iconify';

const evaluateProperty = (property, data) =>
  typeof property === 'function' ? property(data) : property;

/**
 * Renders a stack of action buttons directly for the first two actions and the rest in a menu on larger screens.
 * On smaller screens, all actions are rendered in a menu.
 * @param {Array} actions - Array of action objects containing name, action, params, and icon.
 * @param {Object} params - Parameters to be passed to action functions.
 */

const ActionsRenderer = ({ actions, params }) => {
  const isSmallScreen = useResponsive('down', 'md');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const { directActions, menuActions } = useMemo(() => {
    const filteredActions = actions
      .filter((action) => !action.condition || action.condition(params.data))
      .map((action) => ({
        ...action,
        name: evaluateProperty(action.name, params.data),
        icon: evaluateProperty(action.icon, params.data),
        color: evaluateProperty(action.color, params.data),
      }));

    return {
      directActions: isSmallScreen ? [] : filteredActions.slice(0, 2),
      menuActions: isSmallScreen ? filteredActions : filteredActions.slice(2),
    };
  }, [params.data, actions, isSmallScreen]);

  return (
    <Stack
      height="100%"
      direction="row"
      spacing={0.5}
      alignItems="center"
    >
      {directActions.map((action, index) =>
        action.component ? (
          <Fragment key={index}>{action.component}</Fragment>
        ) : (
          <Tooltip
            arrow
            followCursor
            key={index}
            title={action.name}
          >
            <IconButton
              size="small"
              onClick={() => action.action(params.data)}
              color={action.color || 'default'}
            >
              <Iconify icon={action.icon} />
            </IconButton>
          </Tooltip>
        ),
      )}
      {menuActions.length > 0 && (
        <>
          <IconButton
            size="small"
            onClick={handleClick}
            color="default"
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          <Menu
            id="action-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {menuActions.map((action, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  action.action(params.data);
                  handleClose();
                }}
              >
                <Iconify
                  icon={action.icon}
                  style={{ marginRight: '10px' }}
                />
                {action.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
};

export default memo(ActionsRenderer);
