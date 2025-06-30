// @mui
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { m } from 'framer-motion';
import { useState, useCallback } from 'react';

import { varHover } from '../../../components/animate';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export function useResponsive(query, start, end) {
  const theme = useTheme();

  const mediaUp = useMediaQuery(theme.breakpoints.up(start));

  const mediaDown = useMediaQuery(theme.breakpoints.down(start));

  const mediaBetween = useMediaQuery(theme.breakpoints.between(start, end));

  const mediaOnly = useMediaQuery(theme.breakpoints.only(start));

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  return mediaOnly;
}

// ----------------------------------------------------------------------

export function useWidth() {
  const theme = useTheme();

  const keys = [...theme.breakpoints.keys].reverse();

  return (
    keys.reduce((output, key) => {
      const matches = useMediaQuery(theme.breakpoints.up(key));

      return !output && matches ? key : output;
    }, null) || 'xs'
  );
}

function useBoolean(defaultValue) {
  const [value, setValue] = useState(!!defaultValue);

  const onTrue = useCallback(() => {
    setValue(true);
  }, []);

  const onFalse = useCallback(() => {
    setValue(false);
  }, []);

  const onToggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue,
  };
}

// ----------------------------------------------------------------------

const defaultAttributes = [
  {
    value: 'name',
    label: 'Name',
    icon: <Iconify icon="fluent:person-16-filled" />,
  },
  {
    value: 'phone',
    label: 'Phone',
    icon: <Iconify icon="ic:baseline-phone" />,
  },
  {
    value: 'email',
    label: 'Email',
    icon: <Iconify icon="ic:baseline-email" />,
  },
  {
    value: 'companyName',
    label: 'Company Name',
    icon: <Iconify icon="mdi:company" />,
  },
  {
    value: 'companySize',
    label: 'Company Size',
    icon: <Iconify icon="ic:baseline-email" />,
  },
  {
    value: 'companySize',
    label: 'Company Size',
    icon: <Iconify icon="ic:baseline-people" />,
  },
  {
    value: 'companyWebsite',
    label: 'Company Website',
    icon: <Iconify icon="ph:link-bold" />,
  },
];

// ----------------------------------------------------------------------

export default function UserInfo() {
  const drawer = useBoolean();

  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [attributes, setAttributes] = useState(defaultAttributes);

  const [openDialog, setOpenDialog] = useState(false);
  const [attributeType, setAttributeType] = useState(null);
  const [formatType, setFormatType] = useState(''); // To track selected format type
  const [listOptions, setListOptions] = useState([]); // To store the list options
  const [currentOption, setCurrentOption] = useState(''); // For input tracking

  const handleAddOption = () => {
    if (currentOption) {
      setListOptions((prevOptions) => [...prevOptions, currentOption]);
      setCurrentOption('');
    }
  };
  const handleAddNewAttribute = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAttributeType(null);
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}
    >
      <Typography
        variant="h6"
        sx={{ flexGrow: 1 }}
      >
        Collect user info
      </Typography>
      <Button
        variant="soft"
        onClick={drawer.onFalse}
        sx={{ mr: 1 }}
      >
        Save & Close
      </Button>
    </Stack>
  );

  return (
    <>
      <Button
        variant="soft"
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color="inherit"
        onClick={drawer.onTrue}
      >
        Manage Forms
      </Button>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 600 },
        }}
      >
        {renderHead}

        <Divider />
        <Stack sx={{ p: 2 }}>
          <Autocomplete
            multiple
            options={attributes}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option, { selected }) => (
              <Box
                {...props}
                display="flex"
                alignItems="center"
              >
                <Box mr={1}>{option.icon}</Box>
                {option.label}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose an attribute"
                variant="outlined"
                fullWidth
              />
            )}
            onChange={(event, newValue) => setSelectedAttributes(newValue)}
          />
          <Button
            onClick={handleAddNewAttribute}
            color="primary"
            variant="contained"
            style={{ marginTop: '10px' }}
          >
            + Create Attribute
          </Button>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
          >
            <DialogTitle>What data do you want to collect?</DialogTitle>
            <DialogContent>
              {!attributeType ? (
                <>
                  <Button
                    variant="soft"
                    sx={{ mr: 2 }}
                    onClick={() => setAttributeType('Conversation')}
                  >
                    Conversation data
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => setAttributeType('People')}
                  >
                    People data
                  </Button>
                </>
              ) : (
                <Stack spacing={2}>
                  <Typography>Create a new {attributeType.toLowerCase()} attribute</Typography>

                  <div>
                    <InputLabel>Format</InputLabel>
                    <Select
                      sx={{ width: '100%' }}
                      value={formatType}
                      onChange={(e) => setFormatType(e.target.value)}
                    >
                      <MenuItem value="Text">Text</MenuItem>
                      <MenuItem value="List">List</MenuItem>
                      <MenuItem value="Number">Number</MenuItem>
                      <MenuItem value="Boolean">Boolean</MenuItem>
                      <MenuItem value="Date">Date</MenuItem>
                    </Select>
                  </div>

                  {formatType === 'List' && (
                    <Stack spacing={2}>
                      <TextField
                        value={currentOption}
                        onChange={(e) => setCurrentOption(e.target.value)}
                        label="List Option"
                        placeholder="Add a new option"
                      />
                      <Button
                        onClick={handleAddOption}
                        variant="contained"
                        color="primary"
                      >
                        Add Option
                      </Button>
                      <ul>
                        {listOptions.map((option, index) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </Stack>
                  )}

                  <TextField
                    label="Attribute Name"
                    placeholder="This name will appear in conversations with customers if you ever ask Operator to collect this data."
                  />
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDialog}
                color="primary"
              >
                Cancel
              </Button>
              <Button color="primary">Create</Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Drawer>
    </>
  );
}
