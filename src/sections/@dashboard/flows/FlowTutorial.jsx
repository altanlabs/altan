import {
  DragIndicator,
  Delete,
  Mouse,
  OpenInNew,
  PlayArrow,
  Apple,
  Computer,
} from '@mui/icons-material';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import React, { memo } from 'react';
import { useHistory } from 'react-router';

import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';

const FlowTutorial = ({ open, setOpen }) => {
  const history = useHistory();
  const handleClose = () => {
    setOpen(false);
  };

  const handleDocumentation = () => {
    window.open('https://docs.altan.ai/flows', '_blank');
  };

  const handleTemplate = () => {
    history.push('/marketplace?mode=workflow');
  };

  const isMac = navigator.platform.toLowerCase().includes('mac');
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  const tutorialSteps = [
    {
      icon: <DragIndicator />,
      text: 'Add new modules by dragging from the edge of another module',
    },
    {
      icon: <Delete />,
      text: `Delete a module or edge by selecting it and pressing ${shortcutKey}+Delete`,
    },
    {
      icon: <Mouse />,
      text: `Select multiple modules and edges by holding ${shortcutKey} and clicking`,
    },
    { icon: <Mouse />, text: 'Right-click to open the context menu and see possible actions' },
  ];

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography
          variant="h4"
          component="div"
          gutterBottom
        >
          Welcome to the Workflow Builder!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          paragraph
        >
          Here&apos;s a quick guide to help you get started:
        </Typography>
        <List>
          {tutorialSteps.map((step, index) => (
            <ListItem key={index}>
              <ListItemIcon>{step.icon}</ListItemIcon>
              <ListItemText primary={step.text} />
            </ListItem>
          ))}
        </List>
        <Box
          display="flex"
          justifyContent="space-around"
          mt={4}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<OpenInNew />}
            onClick={handleDocumentation}
          >
            View Documentation
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrow />}
            onClick={handleTemplate}
          >
            Get started with a template
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="primary"
          startIcon={isMac ? <Apple /> : <Computer />}
        >
          Got it!
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(FlowTutorial);
