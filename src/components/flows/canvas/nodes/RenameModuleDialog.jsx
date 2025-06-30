import { TextField, Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useState, useEffect, memo, useCallback } from 'react';

import {
  renameFlowModule,
  clearSelectedModule,
  selectSelectedModule,
} from '../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../redux/store';
import { CardTitle } from '../../../aceternity/cards/card-hover-effect';
import CustomDialog from '../../../dialogs/CustomDialog.jsx';
import Iconify from '../../../iconify/Iconify';

const onClose = () => dispatch(clearSelectedModule());

function RenameModuleDialog() {
  const module = useSelector(selectSelectedModule);

  const open = Boolean(module);
  const [newName, setNewName] = useState('');

  const handleSaveRename = useCallback(() => {
    if (!module) {
      return;
    }
    dispatch(renameFlowModule(module.id, newName)).then(() => {
      onClose();
    });
  }, [module, newName]);

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleSaveRename();
      }
    },
    [handleSaveRename],
  );

  const onChangeName = useCallback((e) => setNewName(e.target.value), []);

  // useEffect(() => {
  //   if (!!open) {
  //     inputRef.current?.focus();
  //   }
  // }, [open]);

  // const setTextInputRef = useCallback((element) => {
  //   inputRef.current = element;
  // }, []);

  useEffect(() => {
    if (!!module?.id) {
      setNewName(module?.meta_data?.name ?? '');
    }
  }, [module?.id]);

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>
        <CardTitle>Rename Module</CardTitle>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          key={`name-of-module-${module?.id}`}
          margin="dense"
          label="Set Name"
          type="text"
          variant="standard"
          fullWidth
          value={newName}
          onChange={onChangeName}
          onKeyUp={handleKeyPress}
          // inputRef={setTextInputRef}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="soft"
          color="success"
          startIcon={<Iconify icon="ant-design:enter-outlined" />}
          onClick={handleSaveRename}
        >
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

export default memo(RenameModuleDialog);
