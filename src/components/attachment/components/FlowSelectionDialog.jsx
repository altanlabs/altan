import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import { useState } from 'react';

const FlowSelectionDialog = ({ 
  open, 
  onClose, 
  flows = [], 
  onSelectFlow,
}) => {
  const [flowSearchTerm, setFlowSearchTerm] = useState('');

  // Filter flows based on search term
  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(flowSearchTerm.toLowerCase()) ||
      (flow.description && flow.description.toLowerCase().includes(flowSearchTerm.toLowerCase())),
  );

  const handleClose = () => {
    setFlowSearchTerm('');
    onClose();
  };

  const handleSelectFlow = (flow) => {
    onSelectFlow(flow);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: 'dark:bg-gray-800' }}
    >
      <DialogTitle className="p-3 text-base font-semibold dark:text-gray-200">
        Select a Workflow
      </DialogTitle>
      <DialogContent
        dividers
        className="p-0"
      >
        {/* Search Input */}
        <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search workflows..."
            value={flowSearchTerm}
            onChange={(e) => setFlowSearchTerm(e.target.value)}
            className="[&_.MuiOutlinedInput-root]:rounded-full [&_.MuiOutlinedInput-root]:p-1 [&_.MuiOutlinedInput-input]:p-1.5 [&_.MuiOutlinedInput-input]:text-sm dark:[&_.MuiOutlinedInput-notchedOutline]:border-gray-600 dark:[&_.MuiInputBase-input::placeholder]:text-gray-400 dark:[&_.MuiInputBase-input]:text-gray-200"
          />
        </div>

        {/* Flow List */}
        <List
          dense
          className="p-0 max-h-72 overflow-y-auto"
        >
          {filteredFlows.length > 0 ? (
            filteredFlows.map((flow) => (
              <ListItem
                key={flow.id}
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleSelectFlow(flow)}
                  className="py-1 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ListItemText
                    primary={flow.name}
                    secondary={flow.description || 'No description'}
                    primaryTypographyProps={{
                      className: 'text-sm font-medium dark:text-gray-100',
                    }}
                    secondaryTypographyProps={{
                      className: 'text-xs text-gray-500 dark:text-gray-400',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem className="px-3">
              <ListItemText
                primary={flows.length === 0 ? 'Loading workflows...' : 'No workflows found.'}
                primaryTypographyProps={{
                  className: 'text-sm text-gray-500 dark:text-gray-400 italic',
                }}
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default FlowSelectionDialog; 