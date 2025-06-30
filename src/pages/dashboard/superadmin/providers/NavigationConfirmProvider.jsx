import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

const NavigationPromptContext = createContext();

export const NavigationPromptProvider = ({ children }) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const blocker = useBlocker(({ historyAction, currentLocation, nextLocation }) => {
    console.log('action', historyAction, nextLocation, currentLocation);
    return (
      isBlocking && (historyAction === 'POP' || currentLocation.pathname !== nextLocation.pathname)
    );
  });
  const resetDialog = useCallback(() => {
    if (blocker) {
      blocker.reset();
    }
    setShowDialog(false);
  }, [setShowDialog, blocker]);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (isBlocking) {
          console.log(event);
          event.preventDefault();
        }
      },
      [isBlocking],
    ),
    { capture: true },
  );

  return (
    <NavigationPromptContext.Provider value={{ setIsBlocking }}>
      <Dialog
        open={showDialog || blocker.state === 'blocked'}
        onClose={resetDialog}
      >
        <DialogTitle>Confirm Navigation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to leave this page? Changes you made may not be saved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetDialog}>Cancel</Button>
          <Button
            onClick={() => blocker.proceed()}
            color="error"
            autoFocus
          >
            Leave
          </Button>
        </DialogActions>
      </Dialog>
      {children}
    </NavigationPromptContext.Provider>
  );
};

export const useNavigationPrompt = () => useContext(NavigationPromptContext);
