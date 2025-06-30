import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import React, { createContext, useCallback, useContext, useState } from 'react';
// Note: React Router v5 doesn't have useBlocker/useBeforeUnload
// This is a simplified version for compatibility

const NavigationPromptContext = createContext();

export const NavigationPromptProvider = ({ children }) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Simplified version for React Router v5 compatibility
  // Navigation blocking functionality would need to be reimplemented
  // using React Router v5's Prompt component if needed
  
  const resetDialog = useCallback(() => {
    setShowDialog(false);
  }, [setShowDialog]);

  // Simple beforeunload handler for browser navigation
  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isBlocking) {
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome
      }
    };

    if (isBlocking) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isBlocking]);

  return (
    <NavigationPromptContext.Provider value={{ setIsBlocking }}>
      <Dialog
        open={showDialog}
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
            onClick={resetDialog}
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
