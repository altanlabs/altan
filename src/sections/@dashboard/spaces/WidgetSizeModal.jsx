import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Button,
} from '@mui/material';
import { useState } from 'react';

import { dispatch } from '@redux/store';

import { updateWidgetSectionSize } from '../../../redux/slices/layout';

const WidgetSizeDialog = ({ isOpen, closeModal, widgetId, parent }) => {
  const [sliderValue, setSliderValue] = useState(6);
  console.log('widget', widgetId);
  const handleSave = () => {
    dispatch(updateWidgetSectionSize({ sectionId: parent, widgetId: widgetId, size: sliderValue }));
    closeModal();
  };
  return (
    <Dialog
      fullWidth
      open={isOpen}
      onClose={closeModal}
    >
      <DialogTitle>Edit Widget Size in Layout</DialogTitle>
      <DialogContent>
        <Slider
          name="size"
          sx={{ mt: 1 }}
          min={1}
          max={12}
          value={sliderValue}
          onChange={(e, newValue) => setSliderValue(newValue)}
        />
        <div>Current Value: {sliderValue}</div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeModal}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetSizeDialog;
