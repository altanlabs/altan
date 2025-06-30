import CloseIcon from '@mui/icons-material/Close';
import { Button, DialogActions, DialogContent } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React, { useState, memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import navConfig from './config-navigation';
import { closePermissionDialog, selectNav, updateAccountMeta } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';

const PermissionsDialog = () => {
  const accountId = useSelector((state) => state.general.account.id);
  const nav = useSelector(selectNav);
  const permissionDialogOpen = useSelector((state) => state.general.permissionDialogOpen);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const handleCheckboxChange = (permission) => (event) => {
    if (event.target.checked) {
      setSelectedPermissions((prevPermissions) => [...prevPermissions, permission]);
    } else {
      setSelectedPermissions((prevPermissions) => prevPermissions.filter((p) => p !== permission));
    }
  };

  const handleSave = () => {
    dispatch(updateAccountMeta(accountId, { nav: selectedPermissions }));
    dispatch(closePermissionDialog());
  };

  useEffect(() => {
    setSelectedPermissions(nav);
  }, [nav]);

  const renderItems = (items) => {
    return items.map((item) => (
      <React.Fragment key={item.title}>
        <ListItem disablePadding>
          <Checkbox
            checked={selectedPermissions.includes(item.permission)}
            onChange={handleCheckboxChange(item.permission)}
          />
          <ListItemText primary={item.title} />
        </ListItem>
        {item.children && (
          <Collapse
            in={selectedPermissions.includes(item.permission)}
            timeout="auto"
            unmountOnExit
          >
            <Box sx={{ pl: 2 }}>
              <List
                component="div"
                disablePadding
              >
                {renderItems(item.children, selectedPermissions, handleCheckboxChange)}
              </List>
            </Box>
          </Collapse>
        )}
      </React.Fragment>
    ));
  };

  return (
    <>
      <Dialog
        open={permissionDialogOpen}
        onClose={() => dispatch(closePermissionDialog())}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Features
          <IconButton
            aria-label="close"
            onClick={() => dispatch(closePermissionDialog())}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            {navConfig
              .filter((section) => section.subheader === 'Features')
              .map((section) => (
                <React.Fragment key={section.subheader}>
                  {section.items && <List disablePadding>{renderItems(section.items)}</List>}
                </React.Fragment>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            variant="soft"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(PermissionsDialog);
