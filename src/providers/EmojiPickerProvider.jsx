import { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';

import EmojiPicker from '../components/EmojiPicker.tsx';

const EmojiPickerContext = createContext();

export const useEmojiPicker = () => {
  const context = useContext(EmojiPickerContext);

  if (context === undefined) {
    return {};
  }

  return context;
};

// Step 1: Update EmojiPicker Context and Provider
const EmojiPickerProvider = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [onSelect, setOnSelect] = useState(null); // Store onSelect function
  const handleClose = () => setAnchorEl(null);

  const handleOpen = useCallback((event, onSelectCallback) => {
    // console.log('opening emoji');
    setAnchorEl(event.currentTarget);
    setOnSelect(() => onSelectCallback); // Update onSelect function
  }, []);

  const contextValue = useMemo(() => ({
    anchorEl,
    handleOpen,
    handleClose,
    onSelect, // Provide onSelect to the context
  }), [anchorEl, handleOpen, onSelect]);

  return (
    <EmojiPickerContext.Provider value={contextValue}>
      {children}
      <EmojiPicker
        onSelect={contextValue.onSelect}
        handleClose={contextValue.handleClose}
        anchorEl={contextValue.anchorEl}
      />
    </EmojiPickerContext.Provider>
  );
};

export default memo(EmojiPickerProvider);
